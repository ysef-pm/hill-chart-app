// src/components/RetroBoard/RetroBoardApp.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useRetroRoom } from './hooks/useRetroRoom';
import { RETRO_SECTIONS } from './constants';
import JoinRoomModal from './JoinRoomModal';
import RetroColumn from './RetroColumn';
import AddItemModal from './AddItemModal';
import ParticipantsPanel from './ParticipantsPanel';
import ExportHabitModal from './ExportHabitModal';

const RetroBoardApp = ({ user, onBack }) => {
  const {
    roomCode,
    room,
    participants,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    addItem,
    removeItem,
    revealAll,
    hideAll,
    leaveRoom,
    getVisibleItems,
    getHiddenCount,
  } = useRetroRoom(user);

  const [showJoinModal, setShowJoinModal] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [exportItem, setExportItem] = useState(null);
  const [copied, setCopied] = useState(false);

  // Show join modal if not in a room
  useEffect(() => {
    if (roomCode) {
      setShowJoinModal(false);
    }
  }, [roomCode]);

  const handleBack = () => {
    if (roomCode) {
      leaveRoom();
      setShowJoinModal(true);
    } else {
      onBack();
    }
  };

  const handleAddClick = (section) => {
    setActiveSection(section);
    setShowAddModal(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      // You could add a toast notification here
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900">
                {room?.name || 'Retro Board'}
              </h1>
              {roomCode && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  <span className="font-mono">{roomCode}</span>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>

          {roomCode && (
            <div className="flex items-center gap-2">
              {/* Reveal/Hide button (host only) */}
              {isHost && (
                <button
                  onClick={room?.isRevealed ? hideAll : revealAll}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${room?.isRevealed
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                >
                  {room?.isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                  {room?.isRevealed ? 'Hide All' : 'Reveal All'}
                </button>
              )}

              {/* Participants button */}
              <button
                onClick={() => setShowParticipants(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                <Users size={18} />
                <span>{Object.keys(participants).length}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      {roomCode ? (
        <main className="max-w-7xl mx-auto p-4">
          {/* Reveal status banner */}
          {!room?.isRevealed && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
              <EyeOff size={18} />
              <span className="text-sm">
                Items are hidden. {isHost ? 'Click "Reveal All" when ready.' : 'Waiting for host to reveal.'}
              </span>
            </div>
          )}

          {/* Columns grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RETRO_SECTIONS.map((section) => (
              <RetroColumn
                key={section.id}
                section={section}
                items={getVisibleItems(section.id)}
                hiddenCount={getHiddenCount(section.id)}
                isRevealed={room?.isRevealed || false}
                currentUserId={user?.uid}
                isHost={isHost}
                onAddClick={() => handleAddClick(section)}
                onDeleteItem={removeItem}
                onExportToHabit={(item) => setExportItem(item)}
              />
            ))}
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-slate-500">
            <p>Create or join a retro to get started</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => roomCode ? setShowJoinModal(false) : onBack()}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        user={user}
        loading={loading}
        error={error}
      />

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addItem}
        section={activeSection}
        participants={participants}
        currentUserId={user?.uid}
      />

      <ParticipantsPanel
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        participants={participants}
        hostId={room?.hostId}
      />

      <ExportHabitModal
        isOpen={!!exportItem}
        onClose={() => setExportItem(null)}
        item={exportItem}
        roomCode={roomCode}
        user={user}
      />
    </div>
  );
};

export default RetroBoardApp;
