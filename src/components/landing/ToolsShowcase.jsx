import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import goatImg from '../../assets/landing/hill_chart_goat.png';
import chameleonImg from '../../assets/landing/feelings_wheel_chameleon.png';
import owlImg from '../../assets/landing/retro_board_owl.png';
import beaverImg from '../../assets/landing/habit_tracker_beaver.png';

const tools = [
    {
        id: 'hill-chart',
        name: 'Hill Chart',
        description: 'Track project progress from uncertainty to execution with visual hill charts.',
        image: goatImg,
        color: 'bg-blue-50',
        textColor: 'text-blue-600',
        delay: 0.1
    },
    {
        id: 'feelings-wheel',
        name: 'Feelings Wheel',
        description: 'Share how your team is feeling during standups and retrospectives.',
        image: chameleonImg,
        color: 'bg-purple-50',
        textColor: 'text-purple-600',
        delay: 0.2
    },
    {
        id: 'retro-board',
        name: 'Retro Board',
        description: 'Run fun and productive sprint retrospectives with your team.',
        image: owlImg,
        color: 'bg-green-50',
        textColor: 'text-green-600',
        delay: 0.3
    },
    {
        id: 'habit-tracker',
        name: 'Habit Tracker',
        description: 'Build good habits as a team and track your progress together.',
        image: beaverImg,
        color: 'bg-amber-50',
        textColor: 'text-amber-600',
        delay: 0.4
    }
];

export default function ToolsShowcase() {
    return (
        <section id="features" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">What's Inside?</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        A suite of simple, powerful tools designed specifically for modern product teams.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tools.map((tool) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: tool.delay }}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className={`aspect-square rounded-xl ${tool.color} mb-6 flex items-center justify-center overflow-hidden p-4`}>
                                <img
                                    src={tool.image}
                                    alt={tool.name}
                                    className="w-full h-full object-contain mix-blend-multiply opacity-80 group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{tool.name}</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                {tool.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
