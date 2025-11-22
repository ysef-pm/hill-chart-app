// src/components/FeelingsWheel/FeelingsWheelApp.jsx

import React, { useState } from 'react';
import { ArrowLeft, Users, Eye, EyeOff, Table, RotateCcw } from 'lucide-react';
import { useFeelingsRoom } from './hooks/useFeelingsRoom';
import { getRandomColor } from './constants';
import JoinRoomModal from './JoinRoomModal';
import AvatarSetupModal from './AvatarSetupModal';
import Wheel from './Wheel';
import YourFeelingCard from './YourFeelingCard';
import RoomInfoBar from './RoomInfoBar';
import ParticipantsPanel from './ParticipantsPanel';
import TeamFeelingsTable from './TeamFeelingsTable';

const FeelingsWheelApp = ({ user, onBack }) => {
  const [showAvatarSetup, setShowAvatarSetup] = useState(false);
  const [pendingRoomAction, setPendingRoomAction] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [initialColor] = useState(getRandomColor());

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
    placeFeeling,
    removeFeeling,
    revealAll,
    hideAll,
    resetAll,
    leaveRoom,
  } = useFeelingsRoom(user);

  const handleCreateRoom = (code) => {
    setPendingRoomAction({ type: 'create', code });
    setShowAvatarSetup(true);
  };

  const handleJoinRoom = (code) => {
    setPendingRoomAction({ type: 'join', code });
    setShowAvatarSetup(true);
  };

  const handleAvatarComplete = async (name, avatarStyle, avatarColor) => {
    let success = false;
    if (pendingRoomAction?.type === 'create') {
      const code = await createRoom(name, avatarStyle, avatarColor);
      success = !!code;
    } else if (pendingRoomAction?.type === 'join') {
      success = await joinRoom(pendingRoomAction.code, name, avatarStyle, avatarColor);
    }

    // Only close modal if operation succeeded
    if (success) {
      setShowAvatarSetup(false);
      setPendingRoomAction(null);
    }
  };

  const handleSelectFeeling = (primary, secondary, tertiary) => {
    placeFeeling(primary, secondary, tertiary);
  };

  const handleBack = () => {
    if (roomCode) {
      leaveRoom();
    } else {
      onBack();
    }
  };

  const participantCount = Object.keys(participants).length;
  const isRevealed = room?.isRevealed;

  // Show join modal if not in a room
  if (!roomCode && !showAvatarSetup) {
    return (
      <>
        <JoinRoomModal
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onClose={onBack}
        />
      </>
    );
  }

  // Show avatar setup
  if (showAvatarSetup) {
    return (
      <AvatarSetupModal
        user={user}
        onComplete={handleAvatarComplete}
        initialColor={initialColor}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Feelings Wheel</h1>
              <p className="text-sm text-slate-500">Place your pin to share how you're feeling</p>
            </div>
          </div>

          <button
            onClick={() => setShowParticipants(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            <Users size={18} />
            {participantCount} Participant{participantCount !== 1 ? 's' : ''}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Wheel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <Wheel
            onSelectFeeling={handleSelectFeeling}
            disabled={!!currentUser?.feeling}
            isRevealed={isRevealed}
            participants={participants}
          />
        </div>

        {/* Your Feeling Card */}
        <YourFeelingCard
          participant={currentUser}
          onRemove={removeFeeling}
        />

        {/* Control Buttons */}
        <div className="flex flex-col items-center gap-3">
          {isHost ? (
            <>
              {!isRevealed ? (
                <button
                  onClick={revealAll}
                  disabled={!Object.values(participants).some(p => p.feeling)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  <Eye size={20} />
                  Reveal All Feelings
                </button>
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={hideAll}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    <EyeOff size={18} />
                    Hide All
                  </button>
                  <button
                    onClick={() => setShowTable(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    <Table size={18} />
                    Show Table
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
                  >
                    <RotateCcw size={18} />
                    Reset All
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-sm">
              {isRevealed ? 'Feelings have been revealed!' : 'Waiting for host to reveal feelings...'}
            </p>
          )}
        </div>

        {/* Room Info Bar */}
        <RoomInfoBar
          roomCode={roomCode}
          participants={participants}
          currentUserId={user?.uid}
        />

        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}
      </main>

      {/* Participants Panel */}
      <ParticipantsPanel
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        roomCode={roomCode}
        participants={participants}
        currentUserId={user?.uid}
      />

      {/* Team Feelings Table */}
      <TeamFeelingsTable
        isOpen={showTable}
        onClose={() => setShowTable(false)}
        roomCode={roomCode}
        participants={participants}
      />
    </div>
  );
};

export default FeelingsWheelApp;
