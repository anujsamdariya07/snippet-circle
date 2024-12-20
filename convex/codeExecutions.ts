import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveExecution = mutation({
  args: {
    language: v.string(),
    code: v.string(),
    // We could have either of them or both at the same time
    error: v.optional(v.string()),
    output: v.optional(v.string()),
  }, 
  handler: async (ctx, args) => {
    const idenitity = await ctx.auth.getUserIdentity()

    if (!idenitity) {
      throw new ConvexError("Not authenticated")
    }

    // Check pro status
    const user = await ctx.db.query('users').withIndex('by_user_id').filter((q) => q.eq(q.field('userId'), idenitity.subject)).first()

    if (!user?.isPro && args.language !== 'javascript') {
      throw new ConvexError("Only pro users can run code in languages other than JavaScript")
    }

    await ctx.db.insert('codeExecutions', {
      ...args,
      userId: idenitity.subject,
    })
  }
})