import express from "express";
import { db } from "../db";
import { departments, subjects } from "../db/schema/app";
import { or, ilike, getTableColumns, sql, and, eq, desc } from "drizzle-orm";

const router = express.Router();

router.get ("/", async(req,res) => {
    try {   
        const { search, department, page = 1, limit = 10 } =req.query;
        const currentPage = Math.max(1, +page);
        const limitPerPage = Math.max(1, +limit);
        const offset = (currentPage -1) * limitPerPage;
        const filterConditions = [];

        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            )
        }

        if(department){
            filterConditions.push(
                ilike(departments.name, `%${department}%`)
            );
        }
        const whereClause = filterConditions.length > 0 ? and (...filterConditions) : undefined;  
        
        const countResult = await db
        .select({count: sql<number>`count(*)`})
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause);
        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db.select({...getTableColumns(subjects)})
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        return res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPage: Math.ceil(totalCount / limitPerPage),
            }
        });
    } catch (e) {
        console.error(`Get /subjects error: ${e}`);
        res.status(500).json({message: "Failed to get Subjects"});
    }
});

export default router;