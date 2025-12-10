import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';

const StorageTest = () => {
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    const runDiagnostic = async (file) => {
        setStatus('uploading');
        setMessage('Starting upload diagnostic...');

        try {
            // 1. Check if bucket exists (by trying to list files)
            const { data: listData, error: listError } = await supabase.storage
                .from('screenshots')
                .list();

            if (listError) {
                if (listError.message.includes('not found')) {
                    throw new Error('CRITICAL: "screenshots" bucket does not exist. Did you run the SQL script?');
                }
                throw new Error(`Bucket Access Error: ${listError.message}`);
            }

            setDebugInfo(prev => prev + `\n✅ Bucket 'screenshots' accessible.`);

            // 2. Try Upload
            const fileName = `debug_${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('screenshots')
                .upload(fileName, file);

            if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`);

            setDebugInfo(prev => prev + `\n✅ File uploaded: ${fileName}`);

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('screenshots')
                .getPublicUrl(fileName);

            setUploadedUrl(publicUrl);
            setDebugInfo(prev => prev + `\n✅ Generated URL: ${publicUrl}`);

            setStatus('success');
            setMessage('Upload Test Passed!');

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.message);
            setDebugInfo(prev => prev + `\n❌ ERROR: ${error.message}`);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-gray-900 text-white rounded-xl border border-gray-700 mt-10">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" />
                Storage Diagnostic
            </h1>

            <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="mb-2 font-bold text-gray-400">Step 1: Upload a test image</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => runDiagnostic(e.target.files[0])}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80"
                    />
                </div>

                {status !== 'idle' && (
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap border border-gray-700">
                        {debugInfo}
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-lg text-center">
                        <p className="text-green-500 font-bold mb-2">✅ Image is Accessible!</p>
                        <img src={uploadedUrl} alt="Test" className="mx-auto h-48 rounded border border-gray-600" />
                        <p className="text-xs text-gray-500 mt-2 break-all">{uploadedUrl}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                        <p className="text-red-500 font-bold">❌ Diagnosis Failed</p>
                        <p className="text-sm mt-1">{message}</p>
                        <p className="text-xs text-gray-400 mt-4">
                            Try running the SQL script again or checking your Supabase project settings.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorageTest;
