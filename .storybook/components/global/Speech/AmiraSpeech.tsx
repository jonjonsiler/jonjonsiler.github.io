import React, { useEffect, useCallback, useRef } from "react";
// import { getUtterance, logSessionInfo, logSentryException, useGenerativeVoiceGlobal } from "@services";
import type { SpeechUtterance } from "@models";

interface AmiraSpeechProps {
  config: any; // Consider a more specific type
  speechProps: Partial<SpeechUtterance>;
  setAbortSpeech: (abortFn: (onAbortComplete?: () => void) => void) => void;
  sendToAvatar: (avatarProps: any) => void; // Consider a more specific type for avatarProps
}

export const AmiraSpeech: React.FC<AmiraSpeechProps> = props => {
  const { speechProps, setAbortSpeech, sendToAvatar, config } = props;
  // const useGenerativeVoice = useGenerativeVoiceGlobal();

  // useRef to keep track of the current speech properties for callbacks,
  // to avoid issues with stale closures if callbacks are defined outside useEffect.
  const currentSpeechPropsRef = useRef(speechProps);
  useEffect(() => {
    currentSpeechPropsRef.current = speechProps;
  }, [speechProps]);

  // Ref to store the previous textToSpeak that was processed
  // const prevTextToSpeakRef = useRef<string | undefined>();

  // const onUtteranceStartHandler = useCallback(() => {
  //   if (
  //     currentSpeechPropsRef.current &&
  //     currentSpeechPropsRef.current.onStart
  //   ) {
  //     currentSpeechPropsRef.current.onStart();
  //   }
  // }, []);

  // const onUtteranceEndHandler = useCallback(() => {
  //   if (currentSpeechPropsRef.current && currentSpeechPropsRef.current.onEnd) {
  //     currentSpeechPropsRef.current.onEnd();
  //   }
  //   // No internal state to clear in AmiraSpeech regarding the utterance itself,
  //   // as Speech.tsx manages the queue and speaking state.
  // }, []);

  // const onWordEndHandler = useCallback((word: any) => {
  //   // Assuming onBoundary was intended for SpeechUtterance, if not, adjust type
  //   // The original class component didn't seem to have onBoundary in its state.speechProps directly
  //   // but called it if it existed on this.state.speechProps.
  //   // For now, let's assume it might be part of the extended props sent to avatar or specific utterances.
  //   // If `speechProps.onBoundary` is a defined part of SpeechUtterance, use that.
  //   // This callback might be specific to what the avatar expects.
  //   // if (currentSpeechPropsRef.current && currentSpeechPropsRef.current.onBoundary) { // If onBoundary exists on SpeechUtterance
  //   //  (currentSpeechPropsRef.current.onBoundary as (word: any) => void)(word);
  //   // }
  //   // console.log("onWordEndHandler called with:", word); // For debugging
  // }, []);

  // useEffect(() => {
  //   if (
  //     speechProps &&
  //     speechProps.textToSpeak &&
  //     speechProps.textToSpeak !== prevTextToSpeakRef.current // Only proceed if textToSpeak is new
  //   ) {
  //     // Update the ref to the current text being processed *before* async operations
  //     prevTextToSpeakRef.current = speechProps.textToSpeak;

  //     const inText = speechProps.textToSpeak;
  //     const includeSpeechMarks = !!speechProps.passThroughSpeechTags;
  //     const locale = speechProps.locale;
  //     const shouldUseGenerative =
  //       typeof speechProps.skipAvatar === "boolean"
  //         ? !speechProps.skipAvatar
  //         : useGenerativeVoice;

  //     getUtterance(
  //       inText,
  //       includeSpeechMarks,
  //       locale,
  //       16000,
  //       shouldUseGenerative
  //     )
  //       .then(resp => {
  //         sendToAvatar({
  //           ...speechProps,
  //           onStart: onUtteranceStartHandler,
  //           onEnd: onUtteranceEndHandler,
  //           onBoundary: onWordEndHandler,
  //           id: resp.id,
  //           audioURL: resp.audioURL,
  //           speech_marks: resp.speech_marks,
  //           speechText: resp.text,
  //         });
  //       })
  //       .catch(err => {
  //         console.log(
  //           `AmiraSpeech: Could not get Utterance for text: ${inText}`,
  //           err
  //         );
  //         logSentryException(err, "Could not get Utterance", {
  //           inText,
  //         });
  //         logSessionInfo("speech_retries_exhausted", inText);
  //         // If utterance fails, call handlers to unblock Speech.tsx queue
  //         // Also, reset prevTextToSpeakRef so this text can be retried if the effect runs again with the same text
  //         prevTextToSpeakRef.current = undefined;
  //         onUtteranceStartHandler();
  //         onUtteranceEndHandler();
  //       });
  //   } else if (
  //     speechProps &&
  //     speechProps.textToSpeak &&
  //     speechProps.textToSpeak === prevTextToSpeakRef.current
  //   ) {
  //     console.log(
  //       "AmiraSpeech: Text to speak is the same as previous, skipping API call:",
  //       speechProps.textToSpeak
  //     );
  //   }
  //   // If speechProps.textToSpeak is empty or undefined, this effect does nothing, which is intended.
  // }, [
  //   speechProps, // Main dependency driving this effect
  //   sendToAvatar,
  //   onUtteranceStartHandler,
  //   onUtteranceEndHandler,
  //   onWordEndHandler,
  //   useGenerativeVoice,
  //   config,
  // ]);

  // useEffect(() => {
  //   const abort = (onAbortComplete?: () => void) => {
  //     console.log("AmiraSpeech: Abort called by parent");
  //     // TODO: Implement actual abort logic for the avatar/speech synthesis if possible.
  //     // This might involve sending a message to an avatar system or stopping an audio player
  //     // that `sendToAvatar` might have triggered.
  //     // For now, we assume it can signal completion immediately.

  //     // Call the onUtteranceEndHandler to ensure the parent (Speech.tsx) processes the end of this speech,
  //     // which helps in clearing queues and states there.
  //     // This simulates the utterance ending abruptly.
  //     onUtteranceEndHandler();

  //     if (onAbortComplete) {
  //       onAbortComplete();
  //     }
  //   };

  //   setAbortSpeech(abort);

  //   // No cleanup function needed for setAbortSpeech if Speech.tsx handles unregistering
  //   // by clearing its list or if the abort function remains valid.
  // }, [setAbortSpeech, onUtteranceEndHandler]);

  return null; // This component does not render anything itself
};