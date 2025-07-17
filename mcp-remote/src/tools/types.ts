import { z } from "zod";

export type tool<Args extends z.ZodRawShape> = {
  name: string;
  description: string;
  schema: Args;
  handler: (
    args: z.infer<z.ZodObject<Args>>,    
  ) =>
    | Promise<{
        content: Array<{
          type: "text";
          text: string;
        }>;
      }>
    | {
        content: Array<{
          type: "text";
          text: string;
        }>;
      };
};
