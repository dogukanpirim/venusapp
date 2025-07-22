
'use client';

// Overwolf SDK Integration for Game Event Tracking
export interface OverwolfEvent {
  eventType: string;
  eventData?: any;
  eventValue?: number;
  matchTime?: number;
  roundNumber?: number;
  weapon?: string;
  victim?: string;
  location?: string;
  distance?: number;
}

export interface MatchData {
  gameTitle: string;
  gameId?: string;
  sessionId?: string;
  matchId?: string;
  gameMode?: string;
  mapName?: string;
  teamName?: string;
  teammates?: string[];
  opponents?: string[];
  rank?: string;
  overwolfVersion?: string;
  gameVersion?: string;
  region?: string;
}

export interface MatchEndData {
  won: boolean;
  score?: string;
  duration?: number;
  playerScore?: number;
  finalStats?: {
    cs?: number;
    gold?: number;
    level?: number;
    wardsPlaced?: number;
    wardsDestroyed?: number;
    accuracy?: number;
    mvp?: boolean;
  };
}

class OverwolfService {
  private static instance: OverwolfService;
  private currentMatchId: string | null = null;
  private isInitialized = false;
  private eventQueue: OverwolfEvent[] = [];

  static getInstance(): OverwolfService {
    if (!OverwolfService.instance) {
      OverwolfService.instance = new OverwolfService();
    }
    return OverwolfService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if running in Overwolf environment
      if (typeof window === 'undefined' || !window.overwolf) {
        console.log('Overwolf not detected, running in mock mode');
        this.isInitialized = true;
        return false;
      }

      // Initialize Overwolf APIs
      await this.initializeOverwolfAPIs();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Overwolf:', error);
      this.isInitialized = true; // Continue in mock mode
      return false;
    }
  }

  private async initializeOverwolfAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.overwolf) {
        reject(new Error('Overwolf not available'));
        return;
      }

      // Initialize game events listener
      this.setupGameEventListeners();
      resolve();
    });
  }

  private setupGameEventListeners(): void {
    if (!window.overwolf?.games?.events) return;

    // Set required features for different games
    const requiredFeatures = {
      'valorant': ['kill', 'death', 'assist', 'match_start', 'match_end'],
      'cs2': ['kill', 'death', 'assist', 'round_start', 'round_end', 'match_start', 'match_end'],
      'league_of_legends': ['kill', 'death', 'assist', 'level', 'match_start', 'match_end']
    };

    // Listen for game events
    window.overwolf.games.events.onNewEvents?.addListener((events: any) => {
      this.handleGameEvents(events);
    });

    window.overwolf.games.events.onInfoUpdates2?.addListener((info: any) => {
      this.handleGameInfoUpdate(info);
    });
  }

  private handleGameEvents(events: any): void {
    if (!events?.events) return;

    for (const event of events.events) {
      this.processGameEvent(event);
    }
  }

  private handleGameInfoUpdate(info: any): void {
    // Handle real-time game info updates
    console.log('Game info update:', info);
  }

  private processGameEvent(event: any): void {
    const overwolfEvent: OverwolfEvent = {
      eventType: this.mapEventType(event.name),
      eventData: event.data,
      eventValue: this.extractEventValue(event),
      matchTime: event.data?.match_time || undefined,
      roundNumber: event.data?.round_number || undefined,
      weapon: event.data?.weapon || undefined,
      victim: event.data?.victim || undefined,
      location: event.data?.location || undefined,
      distance: event.data?.distance || undefined
    };

    if (this.currentMatchId) {
      this.sendEventToAPI(overwolfEvent);
    } else {
      this.eventQueue.push(overwolfEvent);
    }
  }

  private mapEventType(overwolfEventName: string): string {
    const eventMap: Record<string, string> = {
      'kill': 'KILL',
      'death': 'DEATH',
      'assist': 'ASSIST',
      'match_start': 'MATCH_START',
      'match_end': 'MATCH_END',
      'round_start': 'ROUND_START',
      'round_end': 'ROUND_END',
      'ace': 'ACE',
      'clutch': 'CLUTCH',
      'headshot': 'HEADSHOT',
      'first_blood': 'FIRST_BLOOD',
      'mvp': 'MVP',
      'multi_kill': 'MULTI_KILL',
      'bomb_planted': 'PLANT',
      'bomb_defused': 'DEFUSE',
      'damage_dealt': 'DAMAGE_DEALT',
      'healing_done': 'HEALING_DONE'
    };

    return eventMap[overwolfEventName] || overwolfEventName.toUpperCase();
  }

  private extractEventValue(event: any): number | undefined {
    if (event.data?.damage) return parseFloat(event.data.damage);
    if (event.data?.healing) return parseFloat(event.data.healing);
    if (event.data?.gold) return parseFloat(event.data.gold);
    return undefined;
  }

  async startMatch(matchData: MatchData): Promise<string | null> {
    try {
      const response = await fetch('/api/overwolf/match-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...matchData,
          sessionId: this.generateSessionId(),
          overwolfVersion: window.overwolf?.version || 'web'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.currentMatchId = result.matchId;
        
        // Process queued events
        while (this.eventQueue.length > 0) {
          const event = this.eventQueue.shift();
          if (event) {
            await this.sendEventToAPI(event);
          }
        }
        
        return result.matchId;
      }
      
      throw new Error(result.error || 'Failed to start match tracking');
    } catch (error) {
      console.error('Failed to start match:', error);
      return null;
    }
  }

  async sendEvent(event: OverwolfEvent): Promise<boolean> {
    if (!this.currentMatchId) {
      this.eventQueue.push(event);
      return false;
    }

    return await this.sendEventToAPI(event);
  }

  private async sendEventToAPI(event: OverwolfEvent): Promise<boolean> {
    try {
      const response = await fetch('/api/overwolf/match-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: this.currentMatchId,
          ...event
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to send event:', error);
      return false;
    }
  }

  async endMatch(matchEndData: MatchEndData): Promise<boolean> {
    if (!this.currentMatchId) return false;

    try {
      const response = await fetch('/api/overwolf/match-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: this.currentMatchId,
          ...matchEndData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.currentMatchId = null;
        return true;
      }
      
      throw new Error(result.error || 'Failed to end match');
    } catch (error) {
      console.error('Failed to end match:', error);
      return false;
    }
  }

  getCurrentMatchId(): string | null {
    return this.currentMatchId;
  }

  isMatchActive(): boolean {
    return this.currentMatchId !== null;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mock functions for testing without Overwolf
  async mockStartMatch(gameTitle: string): Promise<string | null> {
    const matchData: MatchData = {
      gameTitle,
      gameMode: 'Competitive',
      mapName: 'Test Map',
      rank: 'Gold'
    };
    
    return await this.startMatch(matchData);
  }

  async mockSendEvent(eventType: string, eventValue?: number): Promise<boolean> {
    const event: OverwolfEvent = {
      eventType,
      eventValue,
      matchTime: Math.floor(Date.now() / 1000) % 3600 // Mock match time
    };
    
    return await this.sendEvent(event);
  }

  async mockEndMatch(won: boolean = true): Promise<boolean> {
    const matchEndData: MatchEndData = {
      won,
      score: won ? '13-10' : '10-13',
      duration: 1800, // 30 minutes
      playerScore: Math.floor(Math.random() * 30) + 10
    };
    
    return await this.endMatch(matchEndData);
  }
}

// Global Overwolf types
declare global {
  interface Window {
    overwolf?: {
      version?: string;
      games?: {
        events?: {
          onNewEvents?: {
            addListener: (callback: (events: any) => void) => void;
          };
          onInfoUpdates2?: {
            addListener: (callback: (info: any) => void) => void;
          };
          setRequiredFeatures: (gameId: number, features: string[], callback: (result: any) => void) => void;
        };
      };
    };
  }
}

export const overwolfService = OverwolfService.getInstance();
export default OverwolfService;
