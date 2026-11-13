const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const auth = require('../controllers/authController');
const events = require('../controllers/eventController');
const orders = require('../controllers/orderController');
const tickets = require('../controllers/ticketController');

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.me);

router.get('/events', events.list);
router.get('/events/:id', events.get);
router.post('/events', authenticate, authorize('admin'), events.create);
router.get('/admin/dashboard', authenticate, authorize('admin'), events.dashboard);

// Solo clientes pueden comprar boletos (staff y admin solo validan/check-in)
router.post('/orders', authenticate, authorize('customer'), orders.create);
router.post('/orders/:id/pay', authenticate, authorize('customer'), orders.pay);
router.get('/orders/mine', authenticate, orders.mine);

router.get('/tickets/mine', authenticate, tickets.mine);
router.get('/tickets/:code', authenticate, authorize('staff', 'admin'), tickets.lookup);
router.post('/tickets/checkin', authenticate, authorize('staff', 'admin'), tickets.checkin);

module.exports = router;
