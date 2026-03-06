import HelpQuery from '../models/HelpQuery.model.js';

// @desc   Submit a help query (user-facing, auth optional)
// @route  POST /api/help/submit
export const submitHelpQuery = async (req, res) => {
  try {
    const { name, email, phone, query } = req.body;

    if (!name?.trim() || !email?.trim() || !query?.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email and query are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const helpQuery = await HelpQuery.create({
      userId: req.user?._id || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      query: query.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Your query has been submitted. We will get back to you shortly.',
      data: { id: helpQuery._id }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
