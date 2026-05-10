import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 4000;

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const extraOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...defaultOrigins, ...extraOrigins];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(express.json());

/** @type {Record<string, string[]>} */
const ALLOWED_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['VEHICLE_RECEIVED'],
  VEHICLE_RECEIVED: ['SERVICE_IN_PROGRESS'],
  SERVICE_IN_PROGRESS: ['SERVICE_COMPLETED'],
  SERVICE_COMPLETED: ['FINAL_TOUCHUP_DONE'],
};

function generateReferenceCode() {
  const part = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BK-${part}`;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { brand, model, odometerKm, serviceType } = req.body || {};
    const validTypes = ['WASH_ONLY', 'OIL_CHANGE_SERVICE', 'FULL_SYSTEM_CLEANUP'];

    if (!brand || typeof brand !== 'string' || !brand.trim()) {
      return res.status(400).json({ error: 'Brand is required' });
    }
    if (!model || typeof model !== 'string' || !model.trim()) {
      return res.status(400).json({ error: 'Model is required' });
    }
    const km = Number(odometerKm);
    if (!Number.isFinite(km) || km < 0 || !Number.isInteger(km)) {
      return res.status(400).json({ error: 'Odometer (km) must be a non-negative whole number' });
    }
    if (!serviceType || !validTypes.includes(serviceType)) {
      return res.status(400).json({ error: 'Invalid service type' });
    }

    let referenceCode = generateReferenceCode();
    for (let i = 0; i < 5; i += 1) {
      const exists = await prisma.booking.findUnique({ where: { referenceCode } });
      if (!exists) break;
      referenceCode = generateReferenceCode();
    }

    const booking = await prisma.booking.create({
      data: {
        referenceCode,
        brand: brand.trim(),
        model: model.trim(),
        odometerKm: km,
        serviceType,
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create booking' });
  }
});

app.get('/api/bookings', async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not list bookings' });
  }
});

app.get('/api/bookings/by-reference/:code', async (req, res) => {
  try {
    const code = (req.params.code || '').trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ error: 'Reference code is required' });
    }
    const booking = await prisma.booking.findUnique({
      where: { referenceCode: code },
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load booking' });
  }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status: nextStatus } = req.body || {};
    if (!nextStatus || typeof nextStatus !== 'string') {
      return res.status(400).json({ error: 'status is required' });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const allowed = ALLOWED_TRANSITIONS[booking.status];
    if (!allowed || !allowed.includes(nextStatus)) {
      return res.status(400).json({
        error: `Cannot change status from ${booking.status} to ${nextStatus}`,
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: nextStatus },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update booking' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
