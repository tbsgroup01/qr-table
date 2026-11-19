import AdminSettings from "../models/adminSettingsModel.js";

const getSettingsRecord = async () => {
  let settings = await AdminSettings.findByPk(1);
  if (!settings) {
    settings = await AdminSettings.findOne();
  }
  return settings;
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getSettingsRecord();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await getSettingsRecord();
    if (!settings) {
      settings = await AdminSettings.create({ id: 1, ...req.body });
      return res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: settings,
      });
    }
    const {
      navbarLogo,
      faviconIcon,
      platformName,
      platformTagline,
      supportEmail,
      supportHotline,
      razorpayKeyId,
      razorpayKeySecret,
      isRazorpayLive,
    } = req.body;

    await settings.update({
      navbarLogo: navbarLogo !== undefined ? navbarLogo : settings.navbarLogo,
      faviconIcon: faviconIcon !== undefined ? faviconIcon : settings.faviconIcon,
      platformName: platformName !== undefined ? platformName : settings.platformName,
      platformTagline: platformTagline !== undefined ? platformTagline : settings.platformTagline,
      supportEmail: supportEmail !== undefined ? supportEmail : settings.supportEmail,
      supportHotline: supportHotline !== undefined ? supportHotline : settings.supportHotline,
      razorpayKeyId: razorpayKeyId !== undefined ? razorpayKeyId : settings.razorpayKeyId,
      razorpayKeySecret: razorpayKeySecret !== undefined ? razorpayKeySecret : settings.razorpayKeySecret,
      isRazorpayLive: isRazorpayLive !== undefined ? isRazorpayLive : settings.isRazorpayLive,
    });

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSiteSettings = async (req, res, next) => {
  try {
    let settings = await getSettingsRecord();
    if (!settings) {
      settings = await AdminSettings.create({ id: 1, ...req.body });
      return res.status(200).json({
        success: true,
        message: "Site settings updated successfully",
        data: settings,
      });
    }
    const {
      navbarLogo,
      faviconIcon,
      platformName,
      platformTagline,
      supportEmail,
      supportHotline,
    } = req.body;

    await settings.update({
      navbarLogo: navbarLogo !== undefined ? navbarLogo : settings.navbarLogo,
      faviconIcon: faviconIcon !== undefined ? faviconIcon : settings.faviconIcon,
      platformName: platformName !== undefined ? platformName : settings.platformName,
      platformTagline: platformTagline !== undefined ? platformTagline : settings.platformTagline,
      supportEmail: supportEmail !== undefined ? supportEmail : settings.supportEmail,
      supportHotline: supportHotline !== undefined ? supportHotline : settings.supportHotline,
    });

    res.status(200).json({
      success: true,
      message: "Site settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentSettings = async (req, res, next) => {
  try {
    let settings = await getSettingsRecord();
    if (!settings) {
      settings = await AdminSettings.create({ id: 1, ...req.body });
      return res.status(200).json({
        success: true,
        message: "Payment gateway settings updated successfully",
        data: settings,
      });
    }
    const { razorpayKeyId, razorpayKeySecret, isRazorpayLive } = req.body;

    await settings.update({
      razorpayKeyId: razorpayKeyId !== undefined ? razorpayKeyId : settings.razorpayKeyId,
      razorpayKeySecret: razorpayKeySecret !== undefined ? razorpayKeySecret : settings.razorpayKeySecret,
      isRazorpayLive: isRazorpayLive !== undefined ? isRazorpayLive : settings.isRazorpayLive,
    });

    res.status(200).json({
      success: true,
      message: "Payment gateway settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const resetSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    await settings.update({
      navbarLogo: null,
      faviconIcon: null,
      platformName: "QuickTable",
      platformTagline: "QR Menu, Table Ordering & Diner Arcade",
      supportEmail: "support@quicktable.in",
      supportHotline: "+91 90000 12345",
      razorpayKeyId: null,
      razorpayKeySecret: null,
      isRazorpayLive: true,
    });

    res.status(200).json({
      success: true,
      message: "Settings reset to defaults",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
