"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



//schema :

const loginSchema = z.object({
    email: z.string().email("Pls Enter a valid Email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    //initailize Form
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);

        try{

            const {error} = await signIn.email({
                email: values.email,
                password: values.password,
                rememberMe: true
            })
            console.log(values);

            if(error){
                toast("Login Failed")
                return
            }

            toast(`Login Successfull!! :)`);
            router.push("/")

        }catch(e){
            console.log(e);
            
        }finally{
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form  onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" >
                <FormField control={form.control}
                    name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                    )}
                />
                <FormField control={form.control}
                    name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {
                        isLoading ? "Signing in..." : "Sign in"
                    }

                </Button>
            </form>
        </Form>
        
    )
}

export default LoginForm