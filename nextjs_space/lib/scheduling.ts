
/**
 * Utilitários para cálculo de disponibilidade de horários
 */

export interface TimeSlot {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface WorkHours {
  mon?: TimeSlot[];
  tue?: TimeSlot[];
  wed?: TimeSlot[];
  thu?: TimeSlot[];
  fri?: TimeSlot[];
  sat?: TimeSlot[];
  sun?: TimeSlot[];
}

export interface Break {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface Appointment {
  start_datetime: Date;
  end_datetime: Date;
}

/**
 * Converte dia da semana para chave do WorkHours
 */
function getDayKey(date: Date): keyof WorkHours {
  const days: (keyof WorkHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
}

/**
 * Converte hora "HH:mm" para minutos desde meia-noite
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite para "HH:mm"
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Verifica se uma data está na lista de folgas
 */
function isDayOff(date: Date, daysOff: string[]): boolean {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return daysOff.includes(dateStr);
}

/**
 * Combina data com hora para criar DateTime
 */
function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem
 */
function intervalsOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Calcula os slots disponíveis para um profissional em uma data específica
 */
export function calculateAvailableSlots(
  date: Date,
  serviceDuration: number,
  workHours: WorkHours | null,
  breaks: Break[] | null,
  daysOff: string[] | null,
  appointments: Appointment[]
): string[] {
  // Se não há horários de trabalho definidos, retorna vazio
  if (!workHours) return [];
  
  // Verifica se é dia de folga
  if (daysOff && isDayOff(date, daysOff)) return [];
  
  // Obtém os horários de trabalho do dia
  const dayKey = getDayKey(date);
  const dayWorkHours = workHours[dayKey];
  
  if (!dayWorkHours || dayWorkHours.length === 0) return [];
  
  const availableSlots: string[] = [];
  const breaksList = breaks || [];
  
  // Para cada janela de trabalho do dia
  for (const workSlot of dayWorkHours) {
    const workStart = timeToMinutes(workSlot.start);
    const workEnd = timeToMinutes(workSlot.end);
    
    // Gera todos os slots possíveis nesta janela
    for (let slotStart = workStart; slotStart + serviceDuration <= workEnd; slotStart += 15) {
      const slotEnd = slotStart + serviceDuration;
      const slotTime = minutesToTime(slotStart);
      
      // Verifica se o slot conflita com algum break
      let conflictsWithBreak = false;
      for (const breakSlot of breaksList) {
        const breakStart = timeToMinutes(breakSlot.start);
        const breakEnd = timeToMinutes(breakSlot.end);
        
        if (intervalsOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
          conflictsWithBreak = true;
          break;
        }
      }
      
      if (conflictsWithBreak) continue;
      
      // Verifica se o slot conflita com algum agendamento existente
      const slotStartDate = combineDateAndTime(date, minutesToTime(slotStart));
      const slotEndDate = combineDateAndTime(date, minutesToTime(slotEnd));
      
      let conflictsWithAppointment = false;
      for (const appointment of appointments) {
        const appointmentStart = new Date(appointment.start_datetime);
        const appointmentEnd = new Date(appointment.end_datetime);
        
        if (slotStartDate < appointmentEnd && slotEndDate > appointmentStart) {
          conflictsWithAppointment = true;
          break;
        }
      }
      
      if (conflictsWithAppointment) continue;
      
      // Se passou por todas as verificações, adiciona o slot
      availableSlots.push(slotTime);
    }
  }
  
  return availableSlots;
}

/**
 * Parse JSON strings from database
 */
export function parseWorkHours(workHoursJson: string | null): WorkHours | null {
  if (!workHoursJson) return null;
  try {
    return JSON.parse(workHoursJson);
  } catch {
    return null;
  }
}

export function parseBreaks(breaksJson: string | null): Break[] | null {
  if (!breaksJson) return null;
  try {
    return JSON.parse(breaksJson);
  } catch {
    return null;
  }
}

export function parseDaysOff(daysOffJson: string | null): string[] | null {
  if (!daysOffJson) return null;
  try {
    return JSON.parse(daysOffJson);
  } catch {
    return null;
  }
}

/**
 * Horário padrão de trabalho (seg-sex 9h-18h, sáb 9h-13h)
 */
export const DEFAULT_WORK_HOURS: WorkHours = {
  mon: [{ start: '09:00', end: '18:00' }],
  tue: [{ start: '09:00', end: '18:00' }],
  wed: [{ start: '09:00', end: '18:00' }],
  thu: [{ start: '09:00', end: '18:00' }],
  fri: [{ start: '09:00', end: '18:00' }],
  sat: [{ start: '09:00', end: '13:00' }]
};

/**
 * Pausa padrão para almoço
 */
export const DEFAULT_BREAKS: Break[] = [
  { start: '12:00', end: '13:00' }
];
