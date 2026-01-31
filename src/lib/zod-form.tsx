import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type UseFormProps } from "react-hook-form";
import { z, type ZodTypeAny } from "zod";

type FormValues<TSchema extends ZodTypeAny> = z.infer<TSchema> & FieldValues;

export function useZodForm<TSchema extends ZodTypeAny>(
  props: Omit<UseFormProps<FormValues<TSchema>>, "resolver"> & {
    schema: TSchema;
  },
) {
  const form = useForm<FormValues<TSchema>>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
}
