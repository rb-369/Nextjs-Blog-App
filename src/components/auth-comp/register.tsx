"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";

const registerSchema = z.object({
    name: z.string().min(2, "Username should be at least 2 characters"),
    email: z.string().email("Enter Valid Email Address"),
    password: z.string().min(6, "Password length should be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password length should be at least 6 characters")
}).refine(data => data.password === data.confirmPassword, {
    message: "Password Do not match",
    path: ['confirmPassword']
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps{
    onSuccess?: ()=> void
}

function RegisterForm({onSuccess}: RegisterFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [v, sv] = useState<any>();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }

    })

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true);

        try{
            const {error} = await signUp.email({
                name: values.name,
                email: values.email,
                password: values.password
            })

            if(error){
                toast("Failed to Create account. Please Try again")
                return
            }
            toast("Account Created Successfully. Please Sign in with email and password")

            if(onSuccess){
                onSuccess();
            }

            console.log(values);

        }catch(e){
            console.log(e);
            
            
        }finally{
            setIsLoading(false);
           
        }
    }

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                    )}
                />
                <FormField control={form.control} name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                    )}
                />
                <FormField control={form.control} name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                    )}
                />
                <FormField control={form.control} name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password again" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}
               >
                    {
                        isLoading ? "Creating Account..." : "Create Account"
                    }

                </Button>
               
            </form>
           
            
        </Form>
    )
}

export default RegisterForm