import { grids, auditLogs, settings } from '../models/store.js';
import { v4 as uuidv4 } from 'uuid';

export function getGrids(req, res) {
  res.json({
    grids,
    activeCity: settings.activeCity,
    center: settings.centerCoordinates,
  });
}

export function updateGridStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const grid = grids.find((g) => g.id === id);
  if (!grid) return res.status(404).json({ message: 'Grid not found' });

  grid.status = status;

  auditLogs.push({
    id: uuidv4(),
    action: 'GRID_STATUS_TOGGLED',
    details: `Grid ${id} status set to ${status}`,
    performedBy: 'admin',
    timestamp: new Date().toISOString(),
  });

  res.json(grid);
}

export function updateGridConfig(req, res) {
  const { id } = req.params;
  const { deliveryCharge, baseRadiusKm, status } = req.body;

  const grid = grids.find((g) => g.id === id);
  if (!grid) return res.status(404).json({ message: 'Grid not found' });

  if (deliveryCharge !== undefined) grid.deliveryCharge = Number(deliveryCharge);
  if (baseRadiusKm !== undefined) grid.baseRadiusKm = Number(baseRadiusKm);
  if (status) grid.status = status;

  auditLogs.push({
    id: uuidv4(),
    action: 'GRID_CONFIG_UPDATED',
    details: `Updated parameters for ${id}: fee=₹${grid.deliveryCharge}, radius=${grid.baseRadiusKm}km`,
    performedBy: 'admin',
    timestamp: new Date().toISOString(),
  });

  res.json(grid);
}

export function getServiceAreas(req, res) {
  // Ludhiana operational polygon service area
  const serviceAreas = [
    {
      id: 'area-ldh-metro',
      name: 'Ludhiana Municipal Corporation Zone',
      city: 'Ludhiana',
      polygon: [
        [30.9500, 75.8100],
        [30.9400, 75.8900],
        [30.8600, 75.8900],
        [30.8500, 75.8100],
      ],
      isActive: true,
      totalGrids: grids.length,
    },
  ];
  res.json(serviceAreas);
}

