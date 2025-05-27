"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  isRecording?: boolean;
  summary?: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  isRecording,
  summary,
}: MeetingCardProps) => {
  const { toast } = useToast();
  const [showSummary, setShowSummary] = useState(false);

  const downloadAudio = async () => {
    try {
      // Show loading toast
      toast({
        title: "Preparing audio download...",
        description: "This may take a moment",
      });

      // Create video element
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = link;
      video.muted = true;

      // Wait for video to be loaded
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(video);
      
      // Create gain node to control volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1.0;
      
      // Create destination for recording
      const destination = audioContext.createMediaStreamDestination();
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(destination);
      gainNode.connect(audioContext.destination);

      // Create MediaRecorder with specific audio settings
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      const audioChunks: Blob[] = [];
      let isRecording = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length === 0) {
          toast({
            title: "No audio detected",
            description: "The recording might not contain any audio",
            variant: "destructive"
          });
          return;
        }

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create a file input element to trigger the save dialog
        const downloadLink = document.createElement('a');
        downloadLink.href = audioUrl;
        downloadLink.download = `${title}-audio.webm`;
        
        // Show save dialog
        const saveDialog = document.createElement('input');
        saveDialog.type = 'file';
        //saveDialog.nwsaveas = `${title}-audio.webm`; // This is for NW.js, you might need a different approach
        saveDialog.style.display = 'none';
        document.body.appendChild(saveDialog);

        // Trigger the save dialog
        saveDialog.click();

        // Clean up
        document.body.removeChild(saveDialog);
        URL.revokeObjectURL(audioUrl);
        
        toast({
          title: "Audio ready to save",
          description: "Please choose where to save the file",
        });
      };

      // Start recording when video starts playing
      video.onplay = () => {
        if (!isRecording) {
          mediaRecorder.start();
          isRecording = true;
        }
      };

      // Stop recording when video ends
      video.onended = () => {
        if (isRecording) {
          mediaRecorder.stop();
          isRecording = false;
          audioContext.close();
        }
      };

      // Handle errors
      video.onerror = (error) => {
        console.error('Video error:', error);
        toast({
          title: "Error processing recording",
          description: "Please try again later",
          variant: "destructive"
        });
      };

      // Start playing the video
      try {
        await video.play();
      } catch (error) {
        console.error('Playback error:', error);
        toast({
          title: "Error playing recording",
          description: "Please try again later",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error downloading audio:', error);
      toast({
        title: "Error downloading audio",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const copyMeetingLink = () => {
    // Sadece /meeting/ kısmından sonrasını kopyala
    const meetingId = link.split('/meeting/')[1];
    const shortLink = `/meeting/${meetingId}`;
    
    navigator.clipboard.writeText(shortLink);
    toast({
      title: "Meeting link copied!",
      description: "Share this link with your participants",
    });
  };

  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]">
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-base font-normal">{date}</p>
          </div>
        </div>
      </article>

      {showSummary && summary && (
        <div className="mt-4 p-4 bg-dark-3 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Meeting Summary</h2>
          <p className="text-sm text-gray-300">{summary}</p>
        </div>
      )}

      <article className={cn("flex justify-center relative", {})}>
        <div className="relative flex w-full max-sm:hidden">
          {avatarImages.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="attendees"
              width={40}
              height={40}
              className={cn("rounded-full", { absolute: index > 0 })}
              style={{ top: 0, left: index * 28 }}
            />
          ))}
          <div className="flex-center absolute left-[136px] size-10 rounded-full border-[5px] border-dark-3 bg-dark-4">
            +5
          </div>
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} className="rounded bg-blue-1 px-6">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} />
              )}
              &nbsp; {buttonText}
            </Button>
            {isRecording && (
              <Button
                onClick={downloadAudio}
                className="rounded bg-green-500 px-6"
              >
                <Image
                  src="/icons/download.svg"
                  alt="download audio"
                  width={20}
                  height={20}
                />
                &nbsp; Download Audio
              </Button>
            )}
            {summary && (
              <Button
                onClick={() => setShowSummary(!showSummary)}
                className="bg-purple-1 px-6"
              >
                <Image
                  src="/icons/summary.svg"
                  alt="show summary"
                  width={20}
                  height={20}
                />
                &nbsp; {showSummary ? 'Hide Summary' : 'Show Summary'}
              </Button>
            )}
            <Button
              onClick={copyMeetingLink}
              className="bg-dark-4 px-6"
            >
              <Image
                src="/icons/copy.svg"
                alt="copy link"
                width={20}
                height={20}
              />
              &nbsp; Copy Short Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
