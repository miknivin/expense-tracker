// lib/filters/ExpenseFilters.ts

import { Prisma } from "../generated/prisma";


type SortOrder = 'asc' | 'desc';

export class ExpenseFilters {
  // Filters
  private startDate?: Date;
  private endDate?: Date;
  private minAmount?: Prisma.Decimal;
  private maxAmount?: Prisma.Decimal;
  private categoryIds?: string[];
  private userId?: string;
  private search?: string;
  private hasBillPhoto?: boolean;

  // Pagination & Sorting
  private page?: number;      // 1-based page number from query
  private pageSize: number;   // items per page
  private sortBy: keyof Prisma.ExpenseOrderByWithRelationInput;
  private sortOrder: SortOrder;

  constructor(query: Record<string, any>) {
    // --- Filters ---
    if (query.startDate) this.startDate = new Date(query.startDate as string);
    if (query.endDate) {
      this.endDate = new Date(query.endDate as string);
      this.endDate.setHours(23, 59, 59, 999); // include full end day
    }

    if (query.minAmount !== undefined)
      this.minAmount = new Prisma.Decimal(query.minAmount as string | number);
    if (query.maxAmount !== undefined)
      this.maxAmount = new Prisma.Decimal(query.maxAmount as string | number);

    if (query.categoryId) {
      this.categoryIds = Array.isArray(query.categoryId)
        ? (query.categoryId as string[])
        : [(query.categoryId as string)];
    }

    if (query.userId) this.userId = query.userId as string;

    if (query.search && (query.search as string).trim())
      this.search = (query.search as string).trim();

    if (query.hasBillPhoto !== undefined) {
      this.hasBillPhoto = query.hasBillPhoto === 'true' || query.hasBillPhoto === true;
    }

    // --- Pagination & Sorting ---
    this.page = query.page ? Math.max(1, Number(query.page)) : 1;
    this.pageSize = query.pageSize ? Math.max(1, Math.min(100, Number(query.pageSize))) : 20; // limit max 100

    // Default sort: newest expenses first
    this.sortBy = (query.sortBy as keyof Prisma.ExpenseOrderByWithRelationInput) || 'date';
    this.sortOrder = (query.sortOrder as SortOrder) === 'asc' ? 'asc' : 'desc';
  }

  // Build Prisma where clause
  public toPrismaWhere(): Prisma.ExpenseWhereInput {
    const conditions: Prisma.ExpenseWhereInput[] = [];

    if (this.startDate || this.endDate) {
      conditions.push({
        date: {
          ...(this.startDate && { gte: this.startDate }),
          ...(this.endDate && { lte: this.endDate }),
        },
      });
    }

    if (this.minAmount || this.maxAmount) {
      conditions.push({
        amount: {
          ...(this.minAmount && { gte: this.minAmount }),
          ...(this.maxAmount && { lte: this.maxAmount }),
        },
      });
    }

    if (this.categoryIds && this.categoryIds.length > 0) {
      conditions.push({ categoryId: { in: this.categoryIds } });
    }

    if (this.userId) {
      conditions.push({ userId: this.userId });
    }

    if (this.search) {
      conditions.push({
        description: {
          contains: this.search,
          mode: 'insensitive',
        },
      });
    }

    if (this.hasBillPhoto !== undefined) {
      conditions.push({
        billPhoto: this.hasBillPhoto ? { not: null } : null,
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  // Calculate skip based on page & pageSize
  public getSkip(): number {
    return (this.page! - 1) * this.pageSize;
  }

  public getTake(): number {
    return this.pageSize;
  }

  public getCurrentPage(): number {
    return this.page!;
  }

  public getPageSize(): number {
    return this.pageSize;
  }

  // Full findMany args with pagination, sorting, and includes
  public getFindManyArgs(
    includeOverrides?: Prisma.ExpenseInclude
  ): Prisma.ExpenseFindManyArgs {
    return {
      where: this.toPrismaWhere(),
      skip: this.getSkip(),
      take: this.getTake(),
      orderBy: { [this.sortBy]: this.sortOrder },
      include: includeOverrides ?? { category: true, user: { select: { name: true, email: true } } },
    };
  }

  // Optional: Return pagination metadata (useful for frontend)
  public async getPaginationMetadata(totalCount: number) {
    const totalPages = Math.ceil(totalCount / this.pageSize);

    return {
      page: this.page,
      pageSize: this.pageSize,
      totalCount,
      totalPages,
      hasNextPage: this.page! < totalPages,
      hasPreviousPage: this.page! > 1,
    };
  }
}