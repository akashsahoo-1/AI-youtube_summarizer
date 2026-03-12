import UrlInputForm from "@/components/UrlInputForm";
import { Youtube } from "lucide-react";
import AuthButton from "@/components/AuthButton";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center pt-16 pb-12 px-4 sm:px-6">
            
            <div className="w-full max-w-5xl flex justify-end absolute top-0 p-6 md:p-8 right-0">
                <AuthButton />
            </div>

            <div className="w-full max-w-3xl flex flex-col items-center gap-8">
                
                <div className="flex flex-col items-center text-center gap-4 mt-8">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-red-500/5">
                        <Youtube className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        AI YouTube Summarizer
                    </h1>
                    <p className="text-lg text-gray-400 max-w-xl">
                        Paste a YouTube video and generate instant AI summaries. Extract knowledge in seconds.
                    </p>
                </div>

                <div className="w-full mt-6">
                    <UrlInputForm />
                </div>

            </div>
        </main>
    );
}