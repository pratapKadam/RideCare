export const SERVICE_TYPES = [
  { value: 'WASH_ONLY', label: 'Wash only' },
  { value: 'OIL_CHANGE_SERVICE', label: 'Oil change and service' },
  { value: 'FULL_SYSTEM_CLEANUP', label: 'Full system cleanup' },
];

export const STATUS_ORDER = [
  'PENDING',
  'ACCEPTED',
  'VEHICLE_RECEIVED',
  'SERVICE_IN_PROGRESS',
  'SERVICE_COMPLETED',
  'FINAL_TOUCHUP_DONE',
];

export const STATUS_LABELS = {
  PENDING: 'Awaiting confirmation',
  ACCEPTED: 'Appointment accepted',
  REJECTED: 'Appointment declined',
  VEHICLE_RECEIVED: 'Vehicle received at service center',
  SERVICE_IN_PROGRESS: 'Service in progress',
  SERVICE_COMPLETED: 'Service completed',
  FINAL_TOUCHUP_DONE: 'Final touch-up done — ready for pickup',
};

export function statusStepIndex(status) {
  return STATUS_ORDER.indexOf(status);
}
