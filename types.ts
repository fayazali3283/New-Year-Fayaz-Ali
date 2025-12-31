
export interface GreetingState {
  message: string;
  loading: boolean;
  error: string | null;
}

export interface ImageState {
  url: string | null;
  loading: boolean;
  error: string | null;
}

export interface EventGrounding {
  uri: string;
  title: string;
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
