import express from 'express';
import {
  createNominee,
  getNominees,
  getNomineeById,
  updateNominee,
  deleteNominee,
  getNomineeStats,
  inviteNominee,
  acceptInvite,
  revokeNomineeAccess,
  getMyNomineeAccess,
  logNomineeAccess
} from '../controllers/nominee.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route for accepting invites
router.post('/accept-invite/:token', acceptInvite);

// Protect all other routes
router.use(protect);

router.post('/', createNominee);
router.get('/', getNominees);
router.get('/my-access', getMyNomineeAccess);
router.get('/stats/summary', getNomineeStats);
router.get('/:id', getNomineeById);
router.put('/:id', updateNominee);
router.delete('/:id', deleteNominee);
router.post('/:id/invite', inviteNominee);
router.put('/:id/revoke', revokeNomineeAccess);
router.patch('/:id/access-log', logNomineeAccess);

export default router;
