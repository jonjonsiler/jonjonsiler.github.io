import React from "react";
import Select, {
  components,
} from "react-select";
import type {
  SingleValueProps,
  CSSObjectWithLabel,
  DropdownIndicatorProps,
} from "react-select";
import cx from "classnames";
import { DropdownType } from "@enums";
import { useTranslation } from "react-i18next";
import caratDownIcon from "/images/icons/carat-down.svg";


// Base option type
export type DropdownOption = {
  label: string,
  value: string | string[] | number | {periodId: number, startDate: string, endDate: string},
  icon?: React.ReactNode,
  subtitle?: string,
  style?: React.CSSProperties,
  className?: string,
  tag?: string,
  isDisabled?: boolean,
  originalValue?: any,
}

// Group type for grouped options
export type DropdownGroup = {
  label: string,
  options: DropdownOption[],
}

// Union type for options - can be flat or grouped
export type DropdownOptions = DropdownOption[] | DropdownGroup[];

export type DropdownProperties = {
  type: DropdownType | string,
  placeholder: string,
  isDisabled: boolean,
  isLoading?: boolean,
  value: any,
  options?: DropdownOptions,
  'aria-label': string,
  onChange: (value: any) => void,
  styles?: React.CSSProperties,
  isMulti?: boolean,
  entityLabel?: string,
  className?: string,
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning',
  size?: 'sm' | 'md' | 'lg',
  customColors?: {
    control?: string,
    focusBorder?: string,
    optionSelected?: string,
    optionHover?: string,
    optionText?: string,
    optionSelectedText?: string,
    groupHeader?: string,
    groupHeaderText?: string,
  },
  optionStyles?: React.CSSProperties,
  menuPosition?: 'absolute' | 'fixed',
  menuMaxHeight?: string | number,
}

function SingleValue({
  children,
  ...props
}: SingleValueProps<any>) {
  if (!props.data.icon) return <components.SingleValue {...props}>{children}</components.SingleValue>

  return (
    <components.SingleValue {...props}>
      <div className="d-flex align-items-center">
        <span style={{ marginRight: "0.5rem" }}>{props.data.icon}</span>
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
}

function CustomDropdownIndicator(props: DropdownIndicatorProps<any>) {
  const { selectProps } = props;
  const isOpen = selectProps.menuIsOpen;

  return (
    <components.DropdownIndicator {...props}>
      <img
        src={caratDownIcon}
        alt="dropdown carat"
        className="dropdown-carat"
        style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          height: "1rem",
          width: "1rem",
        }}
      />
    </components.DropdownIndicator>
  );
}

// Helper function to find selected option in both flat and grouped options
const findSelectedOption = (options: DropdownOptions, value: any): DropdownOption | undefined => {
  if (!options || !value) return undefined;

  // Check if options are grouped
  if (options.length > 0 && 'options' in options[0]) {
    // Grouped options
    for (const group of options as DropdownGroup[]) {
      const found = group.options.find(option => option.value === value.value);
      if (found) return found;
    }
  } else {
    // Flat options
    return (options as DropdownOption[]).find(option => option.value === value.value);
  }

  return undefined;
};

export const Dropdown: React.FC<DropdownProperties> = ({
  isDisabled = false,
  placeholder = "",
  type = DropdownType.PRIMARY,
  value = null,
  options = [],
  isLoading = false,
  'aria-label': ariaLabel,
  onChange,
  styles = {},
  entityLabel,
  isMulti = false,
  className,
  variant,
  size,
  customColors,
  optionStyles,
  menuPosition = 'absolute',
  menuMaxHeight
}) => {
  const { t } = useTranslation(['reports']);
  let primaryDropdown = type === DropdownType.PRIMARY;
  let headerDropdown = type === DropdownType.HEADER;

  const dropdownStyle = cx({
    teacherDisabledSelect: isDisabled,
    teacherSecondarySelect: !primaryDropdown && !headerDropdown,
    teacherPrimarySelect: primaryDropdown,
    teacherHeaderSelect: headerDropdown,
  }, className);

  const dropdownPrefixStyle = cx({
    teacherDisabledSelect: isDisabled,
    teacherSecondarySelect: !isDisabled && !primaryDropdown && !headerDropdown,
    teacherPrimarySelect: !isDisabled && primaryDropdown,
    teacherHeaderSelect: !isDisabled && headerDropdown,
  });

  // ensure label of selected value matches option labels
  const clonedValue = value ? { ...value } : value;
  const selectedOption = findSelectedOption(options, clonedValue);
  if (selectedOption) clonedValue.label = selectedOption.label;

  const formatOptionLabel = (
    {value, label, icon, subtitle}: {value: any, label: string, icon?: React.ReactNode, subtitle?: string},
    {context}: {context: 'menu' | 'value'}
  ) => {
    if (icon || subtitle) {
      return (
        <div className="d-flex align-items-center">
          {icon && <span style={{ marginRight: "0.5rem" }}>{icon}</span>}
          <div className="d-flex flex-column">
            <span>{label}</span>
            {subtitle && context === "menu" && (
              <small style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                {subtitle}
              </small>
            )}
          </div>
        </div>
      );
    }
    if (value === "all") {
      if (context === "menu") {
        return t("whole_class");
      } else {
        return label;
      }
    }
    return label;
  };

  const customStyles = {
    control: (base: CSSObjectWithLabel, state: any): CSSObjectWithLabel => ({
      ...base,
      minHeight: size === 'sm' ? '32px' : size === 'lg' ? '48px' : '38px',
      borderColor: state.isFocused ? customColors?.focusBorder || '#007bff' : customColors?.control || '#EACAF2',
      boxShadow: state.isFocused ? `0 0 0 1px ${customColors?.focusBorder || '#007bff'}` : 'none',
      ...styles,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? customColors?.optionSelected || '#007bff' :
                      state.isFocused ? customColors?.optionHover || '#f8f9fa' : 'transparent',
      color: state.isSelected ? customColors?.optionSelectedText || '#fff' :
             customColors?.optionText || base.color,
      fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px',
      padding: size === 'sm' ? '8px 12px' : size === 'lg' ? '14px 16px' : '10px 12px',
      ...optionStyles,
      ...state.data?.style,
    }),
    menu: (base: any) => ({
      ...base,
      ...(menuMaxHeight && { 
        maxHeight: menuMaxHeight,
        overflow: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#c1c1c1 transparent'
      }),
    }),
    menuList: (base: any) => ({
      ...base,
      ...(menuMaxHeight && {
        maxHeight: menuMaxHeight,
        overflow: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden'
      }),
    }),
    group: (base: any) => ({
      ...base,
      paddingBottom: 0,
      paddingTop: 0,
    }),
    groupHeading: (base: any) => ({
      ...base,
      backgroundColor: 'transparent',
      color: customColors?.groupHeaderText || '#333',
      fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      padding: size === 'sm' ? '8px 12px' : size === 'lg' ? '12px 16px' : '10px 12px',
      margin: 0,
      letterSpacing: '0.5px',
    }),
  };

  return (
    <>
      { entityLabel && <span className="entityLabel">{entityLabel}</span> }
      <Select
        menuPlacement="auto"
        menuPosition={menuPosition}
        isSearchable={false}
        className={dropdownStyle}
        classNamePrefix={dropdownPrefixStyle}
        value={value}
        onChange={onChange}
        options={options}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        isDisabled={isLoading}
        aria-label={ariaLabel || ''}
        styles={customStyles}
        components={{ 
          SingleValue,
          DropdownIndicator: CustomDropdownIndicator 
        }}
        isMulti={isMulti}
      />
    </>
  );
};

export default Dropdown;
