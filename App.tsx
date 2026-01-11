import React, { useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/Button';
import { MockupEditor } from './components/MockupEditor';
import { AIEditor } from './components/AIEditor';
import { AppView, ImageSize, MockupProduct } from './types';
import { generateImagePro } from './services/geminiService';
import { Sparkles, CheckCircle2, Wand2, Download } from 'lucide-react';

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

  // Edit State Pass-through
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedLogo(ev.target.result as string);
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
    } catch (error) {
      alert("Failed to generate image. Ensure you've selected a billing project if requested.");
    } finally {
      setIsGenerating(false);
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
          {currentView === AppView.MOCKUP && (
            <MockupEditor
              uploadedLogo={uploadedLogo}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              fileInputRef={fileInputRef}
              handleLogoUpload={handleLogoUpload}
              mockupProducts={MOCKUP_PRODUCTS}
              onEditInStudio={(img) => {
                setImageToEdit(img);
                setCurrentView(AppView.EDIT);
              }}
            />
          )}
          {currentView === AppView.GENERATE && renderGenerateSection()}
          {currentView === AppView.EDIT && (
            <AIEditor
              initialImage={imageToEdit}
              onUploadClick={() => fileInputRef.current?.click()}
              uploadedLogo={uploadedLogo}
              generatedImage={generatedImage}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;