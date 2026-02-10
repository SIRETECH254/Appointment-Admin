import React from 'react';
import type { ITimeSlot } from '../../../../types/api.types';

interface DateSlotSelectionTabProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  handleCheckSlots: () => void;
  isLoadingSlots: boolean;
  availableSlots: ITimeSlot[];
  selectedSlot: ITimeSlot | null;
  setSelectedSlot: (slot: ITimeSlot | null) => void;
  inlineMessage: { type: 'success' | 'error'; text: string } | null;
  canCheckSlots: boolean;
}

const DateSlotSelectionTab: React.FC<DateSlotSelectionTabProps> = ({
  selectedDate,
  onDateChange,
  handleCheckSlots,
  isLoadingSlots,
  availableSlots,
  selectedSlot,
  setSelectedSlot,
  inlineMessage,
  canCheckSlots,
}) => {

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Set default date to today
  React.useEffect(() => {
    if (!selectedDate) {
      onDateChange(new Date().toISOString().split('T')[0]);
    }
  }, [selectedDate, onDateChange]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Select Date & Time</h2>
      <p className="text-gray-500">Choose a date and then check for available time slots.</p>

      <div>
        <label className="label">Date *</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="input"
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label className="label">Available Slots</label>
        <button
          type="button"
          onClick={handleCheckSlots}
          disabled={!canCheckSlots}
          className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingSlots ? 'Checking...' : 'Check Available Slots'}
        </button>
      </div>

      {inlineMessage && (
        <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
      )}

      {availableSlots.length > 0 && (
        <div className="md:col-span-2">
          <label className="label">Select Time Slot *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-2">
            {availableSlots.map((slot: ITimeSlot, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`p-2 rounded border text-sm transition-colors ${
                  selectedSlot?.startTime === slot.startTime
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="md:col-span-2">
          <div className="p-3 bg-brand-primary/5 border border-brand-primary rounded">
            <p className="text-sm font-medium text-brand-primary">
              Selected: {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSlotSelectionTab;
