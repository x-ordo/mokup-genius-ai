import React, { useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/Button';
import { AppView, ImageSize, MockupProduct } from './types';
import { generateImagePro, editImageFlash } from './services/geminiService';
import { Upload, Download, Sparkles, RefreshCw, Wand2, Plus, ArrowRight, CheckCircle2, ImagePlus } from 'lucide-react';

// Hardcoded Mockup Products with CSS positioning logic for the logo
const MOCKUP_PRODUCTS: MockupProduct[] = [
  {
    id: 'mug-1',
    name: 'Classic White Mug',
    url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800',
    logoArea: { top: '35%', left: '30%', width: '35%', height: '35%', rotation: '-5deg' }
  },
  {
    id: 'tshirt-1',
    name: 'Plain White Tee',
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    logoArea: { top: '25%', left: '28%', width: '20%', height: '20%' }
  },
  {
    id: 'totebag-1',
    name: 'Canvas Tote Bag',
    url: 'https://images.unsplash.com/photo-1597484662317-c92534dd2589?auto=format&fit=crop&q=80&w=800',
    logoArea: { top: '40%', left: '35%', width: '30%', height: '30%' }
  },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.MOCKUP);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MockupProduct>(MOCKUP_PRODUCTS[0]);
  
  // Generation State
  const [prompt, setPrompt] = useState('');
  const [genSize, setGenSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Edit State
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  
  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedLogo(ev.target.result as string);
          // Auto switch to edit if they just uploaded and are in edit mode
          if (currentView === AppView.EDIT) {
            setImageToEdit(ev.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       const reader = new FileReader();
       reader.onload = (ev) => {
         if (ev.target?.result) {
           setImageToEdit(ev.target.result as string);
         }
       };
       reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const result = await generateImagePro(prompt, genSize);
      setGeneratedImage(result);
      // Prompt user to edit this newly generated image?
    } catch (error) {
      alert("Failed to generate image. Ensure you've selected a billing project if requested.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt || !imageToEdit) return;
    setIsEditing(true);
    try {
      const result = await editImageFlash(imageToEdit, editPrompt);
      setImageToEdit(result); // Update the editor with the new result
    } catch (error) {
      alert("Failed to edit image.");
    } finally {
      setIsEditing(false);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER SECTIONS ---

  const renderMockupSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">1. Upload Your Logo</h2>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            {uploadedLogo ? (
              <div className="flex flex-col items-center">
                 <img src={uploadedLogo} alt="Uploaded Logo" className="h-24 object-contain mb-2" />
                 <p className="text-sm text-green-600 font-medium">Logo Uploaded!</p>
                 <p className="text-xs text-gray-400 mt-1">Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Click to upload logo</p>
                <p className="text-xs mt-1">PNG, JPG (Transparent recommended)</p>
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

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">2. Select Product</h2>
          <div className="grid grid-cols-2 gap-3">
            {MOCKUP_PRODUCTS.map(product => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                  selectedProduct.id === product.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={product.url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 truncate">
                  {product.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-semibold">Live Preview</h2>
             {uploadedLogo && (
                <Button 
                    variant="outline" 
                    size="sm"
                    icon={<Wand2 className="w-4 h-4"/>}
                    onClick={() => {
                        // Very basic "screenshot" simulation or simply take the product image to edit
                        setImageToEdit(selectedProduct.url); // Ideally we'd screenshot the composite, but for this demo, let's start with product
                        setCurrentView(AppView.EDIT);
                    }}
                >
                    Edit in AI Studio
                </Button>
             )}
           </div>
           
           <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
              {/* Product Base Image */}
              <img 
                src={selectedProduct.url} 
                alt="Product Base" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />
              
              {/* Logo Overlay */}
              {uploadedLogo && (
                <div 
                  className="absolute pointer-events-none select-none mix-blend-multiply"
                  style={{
                    top: selectedProduct.logoArea.top,
                    left: selectedProduct.logoArea.left,
                    width: selectedProduct.logoArea.width,
                    height: selectedProduct.logoArea.height,
                    transform: selectedProduct.logoArea.rotation ? `rotate(${selectedProduct.logoArea.rotation})` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                   <img src={uploadedLogo} alt="Logo Overlay" className="max-w-full max-h-full object-contain" />
                </div>
              )}

              {!uploadedLogo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                   <p className="text-gray-500 font-medium px-4 py-2 bg-white/80 rounded-full shadow-sm backdrop-blur-sm">
                     Upload a logo to see preview
                   </p>
                </div>
              )}
           </div>
           <div className="mt-4 text-center text-sm text-gray-500">
             Note: This is a CSS simulation. For realistic wrapping, use the AI Editor.
           </div>
        </div>
      </div>
    </div>
  );

  const renderGenerateSection = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Generate New Assets</h2>
        <p className="text-gray-500">Use <span className="text-pink-600 font-semibold">Gemini 3 Pro</span> to create high-quality mockup backgrounds or logo concepts.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
             <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                <textarea
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 p-3 min-h-[100px]"
                  placeholder="A minimalist ceramic coffee mug sitting on a wooden table in morning sunlight..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
             </div>
             <div className="w-48">
               <label className="block text-sm font-medium text-gray-700 mb-2">Quality / Size</label>
               <div className="space-y-2">
                 {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                    <label key={size} className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all ${genSize === size ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-gray-300'}`}>
                       <span className="font-medium">{size}</span>
                       <input 
                         type="radio" 
                         name="size" 
                         className="hidden"
                         checked={genSize === size}
                         onChange={() => setGenSize(size)}
                       />
                       {genSize === size && <CheckCircle2 className="w-4 h-4 text-pink-600" />}
                    </label>
                 ))}
               </div>
             </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button 
              variant="secondary" 
              size="lg" 
              isLoading={isGenerating}
              onClick={handleGenerate}
              disabled={!prompt}
              icon={<Sparkles className="w-5 h-5" />}
            >
              Generate Image
            </Button>
          </div>
        </div>
      </div>

      {generatedImage && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-gray-900">Result</h3>
             <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setImageToEdit(generatedImage);
                    setCurrentView(AppView.EDIT);
                  }}
                  icon={<Wand2 className="w-4 h-4" />}
                >
                  Edit Result
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadImage(generatedImage, `generated-${Date.now()}.png`)}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
             </div>
          </div>
          <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
            <img src={generatedImage} alt="Generated result" className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );

  const renderEditSection = () => (
    <div className="h-[calc(100vh-140px)] flex gap-6">
       <div className="w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col">
             <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-600"/> 
                Magic Editor
             </h2>
             <p className="text-sm text-gray-500 mb-6">Powered by Gemini 2.5 Flash</p>
             
             <div className="space-y-4 flex-1">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Select Image to Edit</label>
                   <div className="grid grid-cols-3 gap-2">
                      {uploadedLogo && (
                        <button 
                          onClick={() => setImageToEdit(uploadedLogo)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 ${imageToEdit === uploadedLogo ? 'border-indigo-600' : 'border-gray-200'}`}
                        >
                          <img src={uploadedLogo} className="w-full h-full object-contain p-2" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-0.5 text-center">Logo</div>
                        </button>
                      )}
                      {generatedImage && (
                         <button 
                         onClick={() => setImageToEdit(generatedImage)}
                         className={`relative aspect-square rounded-lg overflow-hidden border-2 ${imageToEdit === generatedImage ? 'border-indigo-600' : 'border-gray-200'}`}
                       >
                         <img src={generatedImage} className="w-full h-full object-cover" />
                         <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-0.5 text-center">Gen</div>
                       </button>
                      )}
                      <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50"
                       >
                         <Plus className="w-5 h-5 text-gray-400" />
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
               disabled={!editPrompt || !imageToEdit}
               icon={<Sparkles className="w-5 h-5" />}
             >
               Apply Edit
             </Button>
          </div>
       </div>

       <div 
         className={`flex-1 bg-gray-100 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-8 relative overflow-hidden ${
           isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
         }`}
         onDragEnter={handleDragEnter}
         onDragLeave={handleDragLeave}
         onDragOver={handleDragOver}
         onDrop={handleDrop}
       >
         <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none"></div>
         
         {isDragging && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-200">
              <Upload className="w-16 h-16 text-indigo-600 mb-4 animate-bounce" />
              <p className="text-xl font-bold text-indigo-700">Drop to Upload</p>
           </div>
         )}

          {imageToEdit ? (
            <div className="relative max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden">
               <img src={imageToEdit} alt="Editing target" className="max-w-full max-h-full object-contain" />
               <div className="absolute top-4 right-4 flex gap-2">
                 <Button variant="outline" size="sm" onClick={() => downloadImage(imageToEdit, 'edited-image.png')}>
                    <Download className="w-4 h-4 mr-2" /> Save
                 </Button>
               </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 pointer-events-none">
               <ImagePlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
               <p>Select an image or drop file here to edit</p>
            </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">
               {currentView === AppView.MOCKUP && 'Product Mockups'}
               {currentView === AppView.GENERATE && 'Generate Assets'}
               {currentView === AppView.EDIT && 'AI Editor'}
             </h1>
             <p className="text-gray-500 text-sm mt-1">
               {currentView === AppView.MOCKUP && 'Visualize your brand on real products.'}
               {currentView === AppView.GENERATE && 'Create unique designs and backgrounds with AI.'}
               {currentView === AppView.EDIT && 'Refine and transform images using natural language.'}
             </p>
           </div>
        </header>

        <div className="fade-in">
          {currentView === AppView.MOCKUP && renderMockupSection()}
          {currentView === AppView.GENERATE && renderGenerateSection()}
          {currentView === AppView.EDIT && renderEditSection()}
        </div>
      </main>
    </div>
  );
};

export default App;