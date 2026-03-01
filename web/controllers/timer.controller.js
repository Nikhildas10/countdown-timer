import Timer from "../models/Timer.js";

export const getStorefrontTimers = async (req, res) => {
  try {
    const { shop } = req.query;
    if (!shop) {
      return res.status(400).json({ error: "Shop domain is required" });
    }
    
    const now = new Date();
    const timers = await Timer.find({ 
      shopDomain: shop, 
      active: true,
      startDate: { $lte: now },
      endDate: { $gt: now }
    });
    
    res.json({ timers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch timers" });
  }
};

export const getTimers = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    console.log(shop,"shop");
    const timers = await Timer.find({ shopDomain: shop }).sort({ createdAt: -1 });
    res.status(200).json(timers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch timers" });
  }
};

export const createTimer = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    const timer = new Timer({ ...req.body, shopDomain: shop });
    await timer.save();
    res.status(201).json(timer);
  } catch (error) {
    res.status(400).json({ error: "Failed to create timer", error });
  }
};

export const updateTimer = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    const timerId = req.params.id;
    const updated = await Timer.findOneAndUpdate(
      { _id: timerId, shopDomain: shop },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update timer" });
  }
};

export const deleteTimer = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    const timerId = req.params.id;
    const deleted = await Timer.findOneAndDelete({ _id: timerId, shopDomain: shop });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete timer" });
  }
};
