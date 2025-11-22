import React from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import ToolsShowcase from '../components/landing/ToolsShowcase';
import Footer from '../components/landing/Footer';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <Header />
            <main>
                <Hero />
                <ToolsShowcase />

                {/* Simple CTA Section */}
                <section className="py-24 bg-slate-900 text-center px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                            Ready to improve your team's communication?
                        </h2>
                        <a
                            href="/login"
                            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                        >
                            Get Started for Free
                        </a>
                        <p className="mt-6 text-slate-400 text-sm">No credit card required • Free forever for small teams</p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
