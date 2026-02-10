import React, { useMemo } from 'react';

interface ServiceSelectionTabProps {
  allServices: any[];
  selectedServices: string[];
  onServiceToggle: (serviceId: string) => void;
  staffId: string;
  allStaff: any[];
}

const ServiceSelectionTab: React.FC<ServiceSelectionTabProps> = ({
  allServices,
  selectedServices,
  onServiceToggle,
  staffId,
  allStaff,
}) => {
  const selectedStaff = useMemo(() => {
    return allStaff.find(s => s._id === staffId);
  }, [staffId, allStaff]);

  const staffServiceIds = useMemo(() => {
    if (!selectedStaff || !selectedStaff.services) return [];
    return selectedStaff.services.map((service: any) => service._id);
  }, [selectedStaff]);

  const isServiceProvidedByStaff = (serviceId: string) => {
    if (!staffId) return true; // No staff selected, all services are potentially available
    return staffServiceIds.includes(serviceId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Select Services</h2>
      <p className="text-gray-500">Choose one or more services for the appointment.</p>

      {!staffId && (
        <div className="alert-error">Please select a staff member first to see available services.</div>
      )}

      {allServices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No services available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allServices.map((service) => {
            const isSelected = selectedServices.includes(service._id);
            const isAvailable = isServiceProvidedByStaff(service._id);

            return (
              <div
                key={service._id}
                onClick={() => isAvailable && onServiceToggle(service._id)}
                className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200 
                  ${isSelected
                    ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }
                  ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`
                }
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handler is on the div to allow full card click
                    disabled={!isAvailable}
                    className="rounded text-brand-primary focus:ring-brand-primary"
                  />
                  <div>
                    <p className={`font-medium ${!isAvailable ? 'text-gray-500' : 'text-gray-900'}`}>
                      {service.name}
                    </p>
                    <p className={`text-sm ${!isAvailable ? 'text-gray-400' : 'text-gray-500'}`}>
                      {service.duration} min
                    </p>
                    {!isAvailable && staffId && (
                      <p className="text-xs text-red-500">Not provided by selected staff</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceSelectionTab;
