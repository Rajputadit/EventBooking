const Event = require('../models/Events.js');

exports.getAllEvents = async (req, res) => {
    try {
        const filters = {};

        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.ticketPrice) {
            filters.ticketPrice = req.query.ticketPrice;
        }

        const events = await Event.find(filters);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    const {
        title,
        description,
        date,
        location,
        category,
        totalSeat,
        totalSeats,
        ticketPrice,
        imageUrl,
        image,
        createBy
    } = req.body;

    try {
        const seatCount = Number(totalSeat ?? totalSeats ?? 0);
        const resolvedImage = imageUrl || image || '';

        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeat: seatCount,
            availableSeats: seatCount,
            ticketPrice: Number(ticketPrice || 0),
            imageUrl: resolvedImage,
            createBy: createBy || req.user._id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    const {
        title,
        description,
        date,
        location,
        category,
        totalSeat,
        totalSeats,
        ticketPrice,
        imageUrl,
        image
    } = req.body;

    try {
        const seatCount = Number(totalSeat ?? totalSeats ?? 0);
        const resolvedImage = imageUrl || image || '';

        const updated = await Event.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                date,
                location,
                category,
                totalSeat: seatCount,
                availableSeats: seatCount,
                ticketPrice: Number(ticketPrice || 0),
                imageUrl: resolvedImage
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event Deleted Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};