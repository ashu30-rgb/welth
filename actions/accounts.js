"use server";
const { db } = require("@/lib/prisma");
const { auth } = require("@clerk/nextjs/server");
const { revalidatePath } = require("next/cache");

const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export const updateDefaultAccount = async (accountId) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAccountsWithTransactions = async (accountId) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transaction: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transaction: true },
      },
    },
  });
  if (!account) return null;

  return {
    ...serializeTransaction(account),
    transactions: account.transaction?.map(serializeTransaction),
  };
};

export const bulkDeletetransactions = async (transactionIds) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transactions.findMany({
      where: {
        id: { ind: transactionIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      acc[transaction.accountId] = (acc[transaction.accountid] || 0) + change;
      return acc;
    }, {});

    // Delete transaction and update account balance in transactions
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      for(const[accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )){
        await tx.account.update({
            where: {id:accountId},
            data:{
                balance:{
                    increment: balanceChange,
                }
            }
        })
      }
    });

    revalidatePath("/dashboard")
    revalidatePath("/account/[id]")

  } catch (error) {
    return {success: false, error: error.message}
  }
};
