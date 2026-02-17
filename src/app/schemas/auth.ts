import {z} from "zod";

export const signInSchema = z.object({
    username : z.string().min(3, 'username must be of altleast 3 characters'),
    password : z.string().min(6 , "Password must be atleast 6 characters "),
}
)

// for the admin we will not need a signup schema as the data will be seeded into the database at the start
/*
export const signUpSchema = z.object({
    username: z.string().min(6, "The username must be at least 6 characters"),
    email: z.string().email("Invalid email"),
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

*/


// in order to use these schmeas we will have to export them 

export type signInFormValues = z.infer<typeof signInSchema> 