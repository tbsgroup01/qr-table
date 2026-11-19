import Plan from "../models/plansModel.js";

export const getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.findAll({
      order: [["price", "ASC"]],
    });

    const activePlans = plans.filter((p) => p.status === "Active");
    const activePlansCount = activePlans.length;

    const entryPlan = plans[0] || null;
    const popularPlan = plans.find((p) => p.isPopular) || plans[1] || null;
    const enterprisePlan = plans[plans.length - 1] || null;

    res.status(200).json({
      success: true,
      count: plans.length,
      metrics: {
        activePlansCount,
        entryTierPrice: entryPlan ? entryPlan.price : 0,
        popularTierPrice: popularPlan ? popularPlan.price : 0,
        enterpriseTierPrice: enterprisePlan ? enterprisePlan.price : 0,
      },
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const {
      name,
      price,
      billingCycle,
      tagline,
      tablesLimit,
      isPopular,
      status,
      colorTheme,
      features,
    } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Plan name and price are required",
      });
    }

    const newPlan = await Plan.create({
      name: name.trim(),
      price: parseFloat(price) || 0,
      billingCycle: billingCycle || "month",
      tagline: tagline || "",
      tablesLimit: tablesLimit || "5 Tables Max",
      isPopular: Boolean(isPopular),
      status: status || "Active",
      colorTheme: colorTheme || "orange",
      features: Array.isArray(features) ? features : [],
    });

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const {
      name,
      price,
      billingCycle,
      tagline,
      tablesLimit,
      isPopular,
      status,
      colorTheme,
      features,
    } = req.body;

    await plan.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(price !== undefined && { price: parseFloat(price) || 0 }),
      ...(billingCycle !== undefined && { billingCycle }),
      ...(tagline !== undefined && { tagline }),
      ...(tablesLimit !== undefined && { tablesLimit }),
      ...(isPopular !== undefined && { isPopular: Boolean(isPopular) }),
      ...(status !== undefined && { status }),
      ...(colorTheme !== undefined && { colorTheme }),
      ...(features !== undefined && {
        features: Array.isArray(features) ? features : [],
      }),
    });

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    await plan.destroy();

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const togglePlanStatus = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    plan.status = plan.status === "Active" ? "Inactive" : "Active";
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Plan status updated to ${plan.status}`,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};
