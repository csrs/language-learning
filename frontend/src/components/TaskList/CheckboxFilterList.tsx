import type { PriorityEnum, StatusEnum } from "./TaskItem";

export const CheckboxFilterList = ({
  filterSet,
  typeOfFilter,
  onSelectCheckbox,
}: {
  filterSet: (StatusEnum | PriorityEnum)[];
  typeOfFilter: string;
  onSelectCheckbox: (
    typeOfFilter: StatusEnum | PriorityEnum,
    isChecked: boolean,
  ) => void;
}) => {
  return (
    <fieldset>
      {filterSet.map((f) => {
        return (
          <div key={f}>
            <input
              type="checkbox"
              id={`${typeOfFilter}-${f}`}
              name={typeOfFilter}
              value={f}
              onChange={(e) => onSelectCheckbox(f, e.currentTarget.checked)}
            />
            <label htmlFor={`${typeOfFilter}-${f}`}>{f}</label>
          </div>
        );
      })}
    </fieldset>
  );
};
