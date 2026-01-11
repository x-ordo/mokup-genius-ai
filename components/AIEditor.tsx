import React, { useState, useEffect } from 'react';
import { Wand2, ImagePlus, Upload, Download, Sparkles, Undo2, Redo2, Eye } from 'lucide-react';
import { Button } from './Button';
import { EditorHistory } from '../types';
import { editImageFlash } from '../services/geminiService';

interface AIEditorProps {
    initialImage: string | null;
    onUploadClick: () => void;
    uploadedLogo: string | null;
    generatedImage: string | null;
}

export const AIEditor: React.FC<AIEditorProps> = ({
    initialImage,
    onUploadClick,
    uploadedLogo,
    generatedImage
}) => {
    const [history, setHistory] = useState<EditorHistory>({
        past: [],
        present: initialImage || '',
        future: []
    });

    const [editPrompt, setEditPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isComparing, setIsComparing] = useState(false);

    // Sync initial image if history is empty
    useEffect(() => {
        if (initialImage && !history.present) {
            setHistory({ past: [], present: initialImage, future: [] });
        }
    }, [initialImage]);

    const handleEdit = async () => {
        if (!editPrompt || !history.present) return;
        setIsEditing(true);
        try {
            const result = await editImageFlash(history.present, editPrompt);

            setHistory(prev => ({
                past: [...prev.past, prev.present],
                present: result,
                future: []
            }));
            setEditPrompt('');
        } catch (error) {
            alert("Failed to edit image.");
        } finally {
            setIsEditing(false);
        }
    };

    const handleUndo = () => {
        setHistory(prev => {
            if (prev.past.length === 0) return prev;
            const previous = prev.past[prev.past.length - 1];
            const newPast = prev.past.slice(0, prev.past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [prev.present, ...prev.future]
            };
        });
    };

    const handleRedo = () => {
        setHistory(prev => {
            if (prev.future.length === 0) return prev;
            const next = prev.future[0];
            const newFuture = prev.future.slice(1);
            return {
                past: [...prev.past, prev.present],
                present: next,
                future: newFuture
            };
        });
    };

    const handleSelectImage = (img: string) => {
        setHistory({
            past: [],
            present: img,
            future: []
        });
    };

    const downloadImage = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Drag handlers (simplified for this component)
    const [isDragging, setIsDragging] = useState(false);
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) handleSelectImage(ev.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const currentDisplayImage = isComparing && history.past.length > 0
        ? history.past[history.past.length - 1]
        : history.present;

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6">
            <div className="w-1/3 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col">
                    <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-indigo-600" />
                        Magic Editor
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">Powered by Gemini 2.5 Flash</p>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Image to Edit</label>
                            <div className="grid grid-cols-3 gap-2">
                                {uploadedLogo && (
                                    <button
                                        onClick={() => handleSelectImage(uploadedLogo)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${history.present === uploadedLogo ? 'border-indigo-600' : 'border-gray-200'}`}
                                    >
                                        <img src={uploadedLogo} className="w-full h-full object-contain p-2" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-0.5 text-center">Logo</div>
                                    </button>
                                )}
                                {generatedImage && (
                                    <button
                                        onClick={() => handleSelectImage(generatedImage)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${history.present === generatedImage ? 'border-indigo-600' : 'border-gray-200'}`}
                                    >
                                        <img src={generatedImage} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-0.5 text-center">Gen</div>
                                    </button>
                                )}
                                <button
                                    onClick={onUploadClick}
                                    className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50"
                                >
                                    <PlusIcon className="w-5 h-5 text-gray-400" />
                                    <span className="text-[10px] text-gray-400">Upload</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Instruction</label>
                            <textarea
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 min-h-[120px] text-sm"
                                placeholder="e.g. 'Add a retro film grain filter', 'Make the background purple', 'Remove the white background'"
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        className="w-full mt-4"
                        size="lg"
                        isLoading={isEditing}
                        onClick={handleEdit}
                        disabled={!editPrompt || !history.present}
                        icon={<Sparkles className="w-5 h-5" />}
                    >
                        Apply Edit
                    </Button>
                </div>
            </div>

            <div
                className={`flex-1 bg-gray-100 rounded-xl border-2 transition-all duration-200 flex flex-col p-8 relative overflow-hidden ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none"></div>

                {/* Toolbar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-100 p-1 flex items-center gap-1 z-10">
                    <button
                        onClick={handleUndo}
                        disabled={history.past.length === 0}
                        className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
                        title="Undo"
                    >
                        <Undo2 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onMouseDown={() => setIsComparing(true)}
                        onMouseUp={() => setIsComparing(false)}
                        onMouseLeave={() => setIsComparing(false)}
                        disabled={history.past.length === 0}
                        className={`p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors ${isComparing ? 'bg-indigo-100 text-indigo-600' : ''}`}
                        title="Hold to Compare"
                    >
                        <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={history.future.length === 0}
                        className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
                        title="Redo"
                    >
                        <Redo2 className="w-4 h-4 text-gray-700" />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                    {currentDisplayImage ? (
                        <div className="relative max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden transition-all duration-200">
                            <img src={currentDisplayImage} alt="Editing target" className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 pointer-events-none">
                            <ImagePlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Select an image or drop file here to edit</p>
                        </div>
                    )}
                </div>

                {history.present && (
                    <div className="absolute top-4 right-4 z-10">
                        <Button variant="outline" size="sm" onClick={() => downloadImage(history.present, 'edited-image.png')}>
                            <Download className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </svg>
);
