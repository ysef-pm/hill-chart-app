// src/components/RetroBoard/RetroBoardApp.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, EyeOff, Copy, Check, MessageSquare } from 'lucide-react';
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
    currentUser: _currentUser,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="glass-card border-b border-[var(--color-border-subtle)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-[var(--color-text-tertiary)]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-[var(--color-text-primary)]">
                  {room?.name || 'Retro Board'}
                </h1>
                {roomCode && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    <span className="font-mono">{roomCode}</span>
                    {copied ? <Check size={14} className="text-[var(--color-accent)]" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {roomCode && (
            <div className="flex items-center gap-2">
              {/* Reveal/Hide button (host only) */}
              {isHost && (
                <button
                  onClick={room?.isRevealed ? hideAll : revealAll}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${room?.isRevealed
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border-subtle)]'
                      : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                    }`}
                >
                  {room?.isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                  {room?.isRevealed ? 'Hide All' : 'Reveal All'}
                </button>
              )}

              {/* Participants button */}
              <button
                onClick={() => setShowParticipants(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] rounded-xl transition-colors border border-[var(--color-border-subtle)]"
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
            <div className="mb-4 p-3 glass-card border border-amber-500/30 flex items-center gap-2 text-amber-400">
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
          <div className="text-center text-[var(--color-text-muted)]">
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
