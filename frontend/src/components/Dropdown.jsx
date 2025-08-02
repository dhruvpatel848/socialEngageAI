import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';

/**
 * Dropdown Component
 * 
 * A reusable dropdown menu component for displaying a list of options.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.trigger - Custom trigger element
 * @param {string} props.label - Label for the default trigger button
 * @param {Array} props.items - Array of menu items
 * @param {string} props.align - Alignment of the dropdown menu ('left', 'right')
 * @param {string} props.width - Width of the dropdown menu ('auto', 'sm', 'md', 'lg', 'xl')
 * @param {string} props.className - Additional CSS classes for the dropdown
 * @param {string} props.buttonClassName - Additional CSS classes for the trigger button
 * @param {string} props.menuClassName - Additional CSS classes for the menu
 */
const Dropdown = ({
  trigger,
  label = 'Options',
  items = [],
  align = 'right',
  width = 'md',
  className = '',
  buttonClassName = '',
  menuClassName = '',
}) => {
  // Determine alignment class
  const alignmentClass = align === 'left' ? 'left-0' : 'right-0';

  // Determine width class
  let widthClass = '';
  switch (width) {
    case 'auto':
      widthClass = '';
      break;
    case 'sm':
      widthClass = 'w-36';
      break;
    case 'md':
      widthClass = 'w-48';
      break;
    case 'lg':
      widthClass = 'w-56';
      break;
    case 'xl':
      widthClass = 'w-72';
      break;
    default:
      widthClass = 'w-48';
      break;
  }

  // Default trigger button
  const defaultTrigger = (
    <Menu.Button
      className={`inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${buttonClassName}`}
    >
      {label}
      <FaChevronDown className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
    </Menu.Button>
  );

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      {({ open }) => (
        <>
          {/* Dropdown Trigger */}
          {trigger || defaultTrigger}

          {/* Dropdown Menu */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`origin-top-${align} absolute ${alignmentClass} mt-2 ${widthClass} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 ${menuClassName}`}
            >
              <div className="py-1">
                {items.map((item, index) => {
                  // Handle divider
                  if (item.divider) {
                    return <div key={`divider-${index}`} className="border-t border-gray-100 my-1" />;
                  }

                  // Handle header
                  if (item.header) {
                    return (
                      <div key={`header-${index}`} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.header}
                      </div>
                    );
                  }

                  // Handle regular menu item
                  return (
                    <Menu.Item key={item.id || index}>
                      {({ active }) => (
                        <button
                          onClick={item.onClick}
                          className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex items-center w-full px-4 py-2 text-sm ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={item.disabled}
                        >
                          {item.icon && (
                            <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
                              {item.icon}
                            </span>
                          )}
                          {item.label}
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default Dropdown;