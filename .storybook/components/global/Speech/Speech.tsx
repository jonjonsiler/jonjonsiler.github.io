// this is a component which handles TTS (Text-to-Speech)
// Any request from another component to speak or stop speaking,
// should go through App's instance of this component

import React, { useState, useEffect, useRef, useCallback } from "react";
import { connect } from "react-redux";
import { Howl } from "howler";
import { 
  getUserData, 
  isiPad, 
  logSentryException,
  shouldForceHTML5Audio,
 } from "@services";
import { AmiraSpeech } from "@components/global";
import type { AvatarSpeechProps, SpeechUtterance, SpeechPassedDownProps } from "@models";
import "./Speech.scss";

interface SpeechProps {
  config: any; // Define more specific type if known
  children: (
    propsToPassDown: SpeechPassedDownProps,
    transcriptInfo: any
  ) => React.ReactNode;
  // Add any dispatch props here if mapDispatchToProps was used
}

export const Speech: React.FC<SpeechProps> = props => {
  const { config, children } = props;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [abortSpeechFunctions, setAbortSpeechFunctions] = useState<
    Array<(...args: any[]) => void>
  >([]);
  const [amiraSpeechProps, setAmiraSpeechProps] = useState<
    Partial<SpeechUtterance>
  >({});
  const [avatarSpeechProps, setAvatarSpeechProps] = useState<AvatarSpeechProps>(
    { textToSpeak: null }
  );
  const [inBackground, setInBackground] = useState(false);

  const speechQueueRef = useRef<
    Array<{ utterance: SpeechUtterance; callback: (() => void) | null }>
  >([]);
  const speechPendingRef = useRef(false);
  const abortSpeechPendingRef = useRef<{
    callback: (() => void) | null;
    props: any;
  } | null>(null);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        destroySound(); // Correctly call the memoized version if it matters, or direct call
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destroySound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.off();
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
  }, []);

  const setAvatarSpeechState = useCallback(
    (newAvatarSpeechProps: AvatarSpeechProps) => {
      setAvatarSpeechProps(newAvatarSpeechProps);
    },
    []
  );

  const internalSetAbortSpeech = useCallback(
    (abortFn: (...args: any[]) => void) => {
      setAbortSpeechFunctions(prev => [...prev, abortFn]);
    },
    []
  );

  const setOnScreenKeyboardOpen = useCallback((isOpen: boolean) => {
    setAvatarSpeechProps(prev => ({
      ...prev,
      oskOpen: isOpen,
    }));
  }, []);

  const onFinishAppSounds = useCallback(
    (soundProps: {
      url: string;
      externalURL?: string;
      volume?: number;
      onfinish?: () => void;
    }) => {
      destroySound();
      if (soundProps.onfinish) {
        soundProps.onfinish();
      }
    },
    [destroySound]
  );

  const playAppSounds = useCallback(
    (soundProps: {
      url: string;
      externalURL?: string;
      volume?: number;
      onfinish?: () => void;
      onStart?: () => void;
    }) => {
      destroySound();
      soundRef.current = new Howl({
        src: [soundProps.externalURL || soundProps.url],
        format: ["mp3"],
        volume: soundProps.volume || (isiPad() ? 0.4 : 1),
        html5: shouldForceHTML5Audio(),
        pool: 1,
        onloaderror: (id, error) => {
          console.error("playAppSounds onload error:", error);
          logSentryException(error, "playAppSounds onload error");
          onFinishAppSounds(soundProps);
        },
        onplayerror: (id, error) => {
          console.error("playAppSounds onplay error:", error);
          logSentryException(error, "playAppSounds onplay error");
          if (soundRef.current) {
            soundRef.current.once("unlock", function () {
              soundRef.current?.play();
              if (soundProps.onStart) {
                soundProps.onStart();
              }
            });
          }
          onFinishAppSounds(soundProps);
        },
        onload: () => {
          soundRef.current?.play();
        },
        onplay: () => {
          if (soundProps.onStart) {
            soundProps.onStart();
          }
        },
        onstop: () => {
          onFinishAppSounds(soundProps);
        },
        onend: () => {
          onFinishAppSounds(soundProps);
        },
      });
    },
    [destroySound, onFinishAppSounds]
  );

  const playAppSoundsWithPromise = useCallback(
    (soundProps: {
      url: string;
      externalURL?: string;
      volume?: number;
      onfinish?: () => void;
      onStart?: () => void;
    }) => {
      const onfinishCallback = soundProps.onfinish;
      return new Promise<void>(resolve => {
        playAppSounds({
          ...soundProps,
          onfinish: () => {
            resolve();
            if (onfinishCallback) onfinishCallback();
          },
        });
      });
    },
    [playAppSounds]
  );

  const speak = useCallback(
    (
      utterance: SpeechUtterance,
      returnToListeningIgnored: boolean,
      callback: (() => void) | null
    ) => {
      speechPendingRef.current = true;
      const userData = getUserData();
      const userSessionLocale =
        userData.sessionData && "locale" in userData.sessionData
          ? (userData.sessionData.locale as string)
          : "en-US";
      const bilingualLocale =
        userData.sessionData && "bilingualLocale" in userData.sessionData
          ? (userData.sessionData.bilingualLocale as string)
          : "es-US";
      const bilingualMode =
        userData.sessionData && "bilingualMode" in userData.sessionData
          ? (userData.sessionData.bilingualMode as boolean)
          : false;

      let effectiveLocale =
        utterance.locale ||
        (utterance.skipTranslation
          ? userSessionLocale
          : bilingualMode
            ? bilingualLocale
            : userSessionLocale);
      let finalUtterance = { ...utterance, locale: effectiveLocale };
      finalUtterance.skipAvatar =
        props.config?.skipAvatar || utterance.skipAvatar;

      const onStart = () => {
        speechPendingRef.current = false;
        if (abortSpeechPendingRef.current) {
          // This is a simplified placeholder. The full abortSpeech logic is complex.
          // Consider a more robust way to trigger the main abortSpeech function if needed.
          console.warn(
            "Aborting speech due to pending abort request during onStart"
          );
          // abortSpeech(abortSpeechPendingRef.current.callback, abortSpeechPendingRef.current.props); // This would be recursive if not careful
          setAmiraSpeechProps(prev => ({ ...prev, textToSpeak: null })); // Attempt to stop AmiraSpeech
          setIsSpeaking(false);
          setAbortSpeechFunctions([]);
          abortSpeechPendingRef.current = null;
        }
        if (utterance.onStart) {
          utterance.onStart();
        }
      };

      const onEnd = () => {
        if (speechQueueRef.current.length > 0) {
          const next = speechQueueRef.current.shift();
          if (next) {
            speak(next.utterance, false, next.callback); // `speak` is already memoized
          }
          if (utterance.onEnd) {
            utterance.onEnd();
          }
          if (callback) {
            callback();
          }
        } else {
          setIsSpeaking(false);
          if (utterance.onEnd) {
            utterance.onEnd();
          }
          if (callback) {
            callback();
          }
        }
      };

      const propsForAmiraSpeech = { ...finalUtterance, onStart, onEnd };
      setAmiraSpeechProps(propsForAmiraSpeech);
      // setIsSpeaking(true); // Moved to queueSpeech to set before first speak call

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [props.config?.skipAvatar, setIsSpeaking, setAmiraSpeechProps]
  ); // Removed `locale` from deps as it's stable from getUserLocale()

  const queueSpeech = useCallback(
    (
      utterance: SpeechUtterance,
      returnToListening: boolean = false,
      callback: (() => void) | null = null,
      forceQueue: boolean = false
    ) => {
      if (isSpeaking || speechQueueRef.current.length > 0 || forceQueue) {
        speechQueueRef.current.push({ utterance, callback });
      } else {
        setIsSpeaking(true); // Set isSpeaking true before calling speak for the first item
        speak(utterance, returnToListening, callback);
      }
    },
    [isSpeaking, speak, setIsSpeaking]
  );

  const speakWithPromise = useCallback(
    (utterance: SpeechUtterance, returnToListening?: boolean) => {
      return new Promise<void>(resolve => {
        queueSpeech(
          { ...utterance, onEnd: resolve, resolveAbort: resolve },
          returnToListening,
          null // Callback managed by promise resolve
        );
      });
    },
    [queueSpeech]
  );

  const speakSequence = useCallback(
    (speechSequenceProps: {
      textToSpeak: Array<{ textToSpeak: string; skipTranslation?: boolean }>;
      passThroughSpeechTags?: any;
      onEnd?: () => void;
      onError?: () => void;
    }) => {
      const {
        textToSpeak: speechArray,
        passThroughSpeechTags,
        onEnd,
        onError,
      } = speechSequenceProps;
      speechArray.forEach((segment, i) => {
        const segmentSpeechProps: SpeechUtterance = {
          textToSpeak: segment.textToSpeak,
          passThroughSpeechTags: passThroughSpeechTags,
          skipTranslation: segment.skipTranslation,
          onEnd: i === speechArray.length - 1 ? onEnd : undefined,
          onError: onError,
        };
        queueSpeech(segmentSpeechProps, false, null, i > 0);
      });
    },
    [queueSpeech]
  );

  const speakAudioFile = useCallback(
    (audioProps: {
      url: string;
      onfinish?: () => void;
      externalURL?: string;
      volume?: number;
    }) => {
      playAppSounds({
        url: audioProps.url,
        externalURL: audioProps.externalURL,
        volume: audioProps.volume,
        onfinish: audioProps.onfinish,
      });
    },
    [playAppSounds]
  );

  const abortSpeech = useCallback(
    (
      callback: (() => void) | null = null,
      abortProps: { returnToListening?: boolean } = {}
    ) => {
      if (speechPendingRef.current && !isSpeaking) {
        // If speech is pending but not officially started via Lexa
        abortSpeechPendingRef.current = { callback, props: abortProps };
        // Potentially clear Lexa props if it's about to speak something pending
        setAmiraSpeechProps(prev => ({ ...prev, textToSpeak: null }));
        // Call callbacks directly if nothing more to do
        if (callback) callback();
        setIsSpeaking(false); // Ensure speaking state is false
        speechPendingRef.current = false; // Reset pending flag
        speechQueueRef.current = []; // Clear queue
        setAbortSpeechFunctions([]); // Clear registered abort functions
        return; // Early exit
      }

      destroySound();

      speechQueueRef.current = [];

      let functionsToCall = [...abortSpeechFunctions]; // Snapshot before clearing
      setAbortSpeechFunctions([]); // Clear registered abort functions for next time
      abortSpeechPendingRef.current = null; // Clear pending abort requests
      speechPendingRef.current = false; // Clear speech pending flag

      if (functionsToCall.length > 0) {
        let functionsCalled = 0;
        const checkDone = () => {
          functionsCalled++;
          if (functionsCalled >= functionsToCall.length) {
            setIsSpeaking(false);
            if (callback) callback();
          }
        };
        functionsToCall.forEach(abortFn => {
          if (typeof abortFn === "function") {
            abortFn(checkDone); // Assuming abortFn from AmiraSpeech now takes a callback
          } else {
            checkDone();
          }
        });
      } else {
        // No abort functions were registered (e.g., AmiraSpeech didn't call setAbortSpeech or was already cleared)
        setIsSpeaking(false);
        if (callback) callback();
      }
      setAmiraSpeechProps(prev => ({ ...prev, textToSpeak: null })); // Also ensure AmiraSpeech is cleared
    },
    [destroySound, abortSpeechFunctions, isSpeaking]
  ); // Added isSpeaking to deps

  const passedDownProps: SpeechPassedDownProps = {
    setAbortSpeech: internalSetAbortSpeech,
    speak: queueSpeech,
    speakWithPromise,
    speakSequence,
    speakAudioFile,
    abortSpeech,
    setOnScreenKeyboardOpen,
    playAppSounds,
    playAppSoundsWithPromise,
    isSpeaking,
    avatarSpeechProps,
    inBackground,
  };

  return (
    <div className="speech">
      <AmiraSpeech
        config={config}
        speechProps={amiraSpeechProps}
        setAbortSpeech={internalSetAbortSpeech}
        sendToAvatar={setAvatarSpeechState}
      />
      {children(passedDownProps, {})}
    </div>
  );
};