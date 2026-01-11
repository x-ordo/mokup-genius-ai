import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Upload, Check, X, Sliders } from 'lucide-react';
import { MockupProduct } from '../types';

interface MockupEditorProps {
    uploadedLogo: string | null;
    selectedProduct: MockupProduct;
    setSelectedProduct: (product: MockupProduct) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    mockupProducts: MockupProduct[];
    onEditInStudio: (image: string) => void;
}

export const MockupEditor: React.FC<MockupEditorProps> = ({
    uploadedLogo,
    selectedProduct,
    setSelectedProduct,
    fileInputRef,
    handleLogoUpload,
    mockupProducts,
    onEditInStudio
}) => {
    // Transform State
    const [opacity, setOpacity] = useState(0.9);
    const [rotateZ, setRotateZ] = useState(0);
    const [rotateX, setRotateX] = useState(0); // Tilt
    const [rotateY, setRotateY] = useState(0); // Turn
    const [blendMode, setBlendMode] = useState<React.CSSProperties['mixBlendMode']>('multiply');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="space-y-6">
                {/* 1. Upload */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">1. Upload Your Logo</h2>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                    >
                        {uploadedLogo ? (
                            <div className="flex flex-col items-center">
                                <img src={uploadedLogo} alt="Uploaded Logo" className="h-16 object-contain mb-2" />
                                <p className="text-sm text-green-600 font-medium">Logo Uploaded!</p>
                                <p className="text-xs text-gray-400 mt-1">Click to change</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <Upload className="w-8 h-8 mb-2" />
                                <p className="text-sm font-medium">Click to upload</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                        />
                    </div>
                </div>

                {/* 2. Product Select */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">2. Select Product</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {mockupProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${selectedProduct.id === product.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <img src={product.url} alt={product.name} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Style & Position (NEW) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sliders className="w-5 h-5" /> 3. Style & Position
                    </h2>

                    <div className="space-y-4">
                        {/* Blend Mode */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Blend Mode</label>
                            <select
                                value={blendMode}
                                onChange={(e) => setBlendMode(e.target.value as any)}
                                className="w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="multiply">Multiply (Default)</option>
                                <option value="overlay">Overlay</option>
                                <option value="screen">Screen (Light)</option>
                                <option value="normal">Normal</option>
                                <option value="darken">Darken</option>
                                <option value="soft-light">Soft Light</option>
                            </select>
                        </div>

                        {/* Opacity */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <label className="font-medium text-gray-500 uppercase">Opacity</label>
                                <span className="text-gray-400">{Math.round(opacity * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Transforms */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Rotate (Z)</label>
                                <input
                                    type="range" min="-180" max="180"
                                    value={rotateZ} onChange={(e) => setRotateZ(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Tilt (X)</label>
                                <input
                                    type="range" min="-60" max="60"
                                    value={rotateX} onChange={(e) => setRotateX(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Turn (Y)</label>
                                <input
                                    type="range" min="-60" max="60"
                                    value={rotateY} onChange={(e) => setRotateY(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Live Preview</h2>
                        {uploadedLogo && (
                            <button
                                onClick={() => onEditInStudio(selectedProduct.url)}
                                className="text-sm border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors flex items-center gap-2"
                            >
                                Edit in AI Studio
                            </button>
                        )}
                    </div>

                    <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 select-none">
                        {/* Product Base Image */}
                        <img
                            src={selectedProduct.url}
                            alt="Product Base"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />

                        {/* Interactive Logo Overlay */}
                        {uploadedLogo && (
                            <Rnd
                                default={{
                                    x: parseInt(selectedProduct.logoArea.left) * 5 || 100,
                                    y: parseInt(selectedProduct.logoArea.top) * 5 || 100,
                                    width: 200,
                                    height: 200,
                                }}
                                bounds="parent"
                                lockAspectRatio={true}
                                className="border-2 border-transparent hover:border-indigo-400 border-dashed group"
                                style={{ perspective: '1000px' }} // IMPORTANT for 3D
                            >
                                <img
                                    src={uploadedLogo}
                                    alt="Logo Overlay"
                                    className="w-full h-full object-contain pointer-events-none transition-transform duration-75"
                                    style={{
                                        opacity: opacity,
                                        mixBlendMode: blendMode,
                                        transform: `rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
                                    }}
                                />
                            </Rnd>
                        )}

                        {!uploadedLogo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                <p className="text-gray-500 font-medium px-4 py-2 bg-white/80 rounded-full shadow-sm backdrop-blur-sm">
                                    Upload a logo to see preview
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Drag to position. Use controls for 3D tilt & blending.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
