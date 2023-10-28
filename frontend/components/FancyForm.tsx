import { FormEvent, HTMLInputTypeAttribute, useState } from "react";
import FancyButton from "./FancyButton";
import { isPromise } from "util/types";

export type Field = {
    name: string;
    inputType?: HTMLInputTypeAttribute;
    required?: boolean;
};

export default function FancyForm({
    fields,
    onSubmit,
}: {
    fields: Field[];
    onSubmit: (fieldValues: string[]) => Promise<string | undefined>;
}) {
    const [error, setError] = useState<string>("");
    const [fieldValues, setFieldValues] = useState<string[]>(
        new Array(fields.length).fill("")
    );

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        Promise.resolve(onSubmit(fieldValues)).then((errorMsg) => {
            if (errorMsg !== undefined && errorMsg !== "") setError(errorMsg);
            else setError("");
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-slate-100  flex flex-col justify-center items-center p-4 gap-4 rounded-lg outline outline-blue-500 outline-4"
        >
            {fields.map((field, i) => (
                <div className="flex w-full" key={i}>
                    <div className="w-1/3 text-slate-600 flex justify-center items-center text-center">
                        {field.name}
                    </div>
                    <input
                        className="w-2/3 bg-slate-200 rounded-md p-2"
                        type={field.inputType}
                        name={field.name}
                        required={field.required}
                        onChange={(event) =>
                            setFieldValues(
                                fieldValues.map((fieldValue, fieldIdx) =>
                                    fieldIdx == i
                                        ? event.target.value
                                        : fieldValue
                                )
                            )
                        }
                        value={fieldValues[i]}
                    />
                </div>
            ))}
            <div className="text-red-500 font-semibold">{error}</div>
            <FancyButton type="submit">Submit</FancyButton>
        </form>
    );
}
