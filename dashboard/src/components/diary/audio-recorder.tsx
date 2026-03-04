'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useAuth } from '@/context/auth-context';
import { useVault } from '@/hooks/use-vault';

interface AudioRecorderProps {
    onSuccess?: (data: any) => void;
    isUnlocked?: boolean;
}

export function AudioRecorder({ onSuccess, isUnlocked }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const { token } = useAuth();
    const { encrypt } = useVault();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await handleAudioUpload(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Microphone access denied or unavailable.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
        }
    };

    const handleAudioUpload = async (audioBlob: Blob) => {
        try {
            if (!token) return;

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const url = isUnlocked ? '/api/voice-journal?encrypt=true' : '/api/voice-journal';

            const response = await api.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                const { category, refined_text } = response.data.data;
                const categoryTag = category ? `[${category}] ` : '';
                const baseNote = `${categoryTag}${refined_text} (Transcribed from Voice)`;

                if (isUnlocked) {
                    const encrypted = await encrypt(baseNote);

                    const payload = {
                        score: null,
                        note: encrypted.cipher,
                        iv: encrypted.iv,
                        salt: encrypted.salt,
                        is_encrypted: true
                    };

                    await api.post('/api/mood', payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                if (onSuccess) onSuccess(response.data);
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            alert('Failed to process voice journal.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return (
            <button disabled className="p-2 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </button>
        );
    }

    if (isRecording) {
        return (
            <button
                onClick={stopRecording}
                className="p-2 rounded-full border border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
            >
                <Square className="w-5 h-5" fill="currentColor" />
            </button>
        );
    }

    return (
        <button
            onClick={startRecording}
            className="p-2 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
            <Mic className="w-5 h-5" />
        </button>
    );
}
