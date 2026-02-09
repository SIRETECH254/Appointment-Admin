


const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type WorkingHours = {
  [key: string]: { start: string; end: string }[];
};

type WorkingHoursInputProps = {
  workingHours: WorkingHours;
  onChange: (workingHours: WorkingHours) => void;
};

const WorkingHoursInput = ({ workingHours, onChange }: WorkingHoursInputProps) => {
  const handleTimeChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const newWorkingHours = { ...workingHours };
    newWorkingHours[day][index][field] = value;
    onChange(newWorkingHours);
  };

  const handleAddSlot = (day: string) => {
    const newWorkingHours = { ...workingHours };
    if (!newWorkingHours[day]) {
      newWorkingHours[day] = [];
    }
    newWorkingHours[day].push({ start: '09:00', end: '17:00' });
    onChange(newWorkingHours);
  };

  const handleRemoveSlot = (day: string, index: number) => {
    const newWorkingHours = { ...workingHours };
    newWorkingHours[day].splice(index, 1);
    onChange(newWorkingHours);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-gray-900">Working Hours</h3>
      {days.map((day) => (
        <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div className="md:col-span-1">
            <span className="capitalize font-medium">{day}</span>
          </div>
          <div className="md:col-span-2 space-y-2">
            {(workingHours[day] || []).map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => handleTimeChange(day, index, 'start', e.target.value)}
                  className="input"
                />
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => handleTimeChange(day, index, 'end', e.target.value)}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(day, index)}
                  className="btn-secondary bg-red-500 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddSlot(day)}
              className="btn-secondary"
            >
              Add Slot
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkingHoursInput;
