
export interface AvatarSpeechProps {
  textToSpeak: string | null;
  dance?: any;
  oskOpen?: boolean;

  id?: string;
  audioURL?: string;
  speech_marks?: any;
  speechText?: string;

  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export interface SpeechUtterance {
  textToSpeak: string | null;
  locale?: string;
  skipTranslation?: boolean;
  skipAvatar?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
  resolveAbort?: () => void; // For speakWithPromise
  passThroughSpeechTags?: any;
}

export interface SpeechPassedDownProps {
  setAbortSpeech: (abortFn: (...args: any[]) => void) => void; // Changed argument type
  speak: (
    utterance: SpeechUtterance,
    returnToListening?: boolean,
    callback?: (() => void) | null,
    forceQueue?: boolean
  ) => void;
  speakWithPromise: (
    utterance: SpeechUtterance,
    returnToListening?: boolean
  ) => Promise<void>;
  speakSequence: (speechProps: {
    textToSpeak: Array<{ textToSpeak: string; skipTranslation?: boolean }>;
    passThroughSpeechTags?: any;
    onEnd?: () => void;
    onError?: () => void;
  }) => void;
  speakAudioFile: (props: {
    url: string;
    onfinish?: () => void;
    externalURL?: string;
    volume?: number;
  }) => void;
  abortSpeech: (
    callback?: (() => void) | null,
    props?: { returnToListening?: boolean }
  ) => void;
  setOnScreenKeyboardOpen: (isOpen: boolean) => void;
  playAppSounds: (props: {
    url: string;
    externalURL?: string;
    volume?: number;
    onfinish?: () => void;
    onStart?: () => void;
  }) => void;
  playAppSoundsWithPromise: (props: {
    url: string;
    externalURL?: string;
    volume?: number;
    onfinish?: () => void;
    onStart?: () => void;
  }) => Promise<void>;
  isSpeaking: boolean;
  avatarSpeechProps: AvatarSpeechProps;
  inBackground: boolean;
}