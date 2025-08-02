import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Stepper Component
 * 
 * A reusable stepper component for multi-step processes or wizards.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.steps - Array of step objects with title and optional description
 * @param {number} props.activeStep - Index of the active step
 * @param {function} props.onStepClick - Function to call when a step is clicked
 * @param {string} props.orientation - Orientation of the stepper ('horizontal', 'vertical')
 * @param {string} props.size - Size of the stepper ('sm', 'md', 'lg')
 * @param {boolean} props.showLabels - Whether to show step labels
 * @param {boolean} props.showNumbers - Whether to show step numbers
 * @param {boolean} props.showIcons - Whether to show step icons
 * @param {boolean} props.allowClickOnCompleted - Whether to allow clicking on completed steps
 * @param {string} props.className - Additional CSS classes for the stepper
 */
const Stepper = ({
  steps = [],
  activeStep = 0,
  onStepClick,
  orientation = 'horizontal',
  size = 'md',
  showLabels = true,
  showNumbers = true,
  showIcons = true,
  allowClickOnCompleted = true,
  className = '',
}) => {
  // Determine step size
  let stepSizeClass = '';
  let iconSize = 0;
  let fontSize = '';
  
  switch (size) {
    case 'sm':
      stepSizeClass = 'h-6 w-6';
      iconSize = 12;
      fontSize = 'text-xs';
      break;
    case 'lg':
      stepSizeClass = 'h-10 w-10';
      iconSize = 20;
      fontSize = 'text-base';
      break;
    case 'md':
    default:
      stepSizeClass = 'h-8 w-8';
      iconSize = 16;
      fontSize = 'text-sm';
      break;
  }

  // Handle step click
  const handleStepClick = (index) => {
    if (onStepClick && (index < activeStep || allowClickOnCompleted)) {
      onStepClick(index);
    }
  };

  // Render horizontal stepper
  const renderHorizontalStepper = () => {
    return (
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isClickable = onStepClick && (isCompleted || allowClickOnCompleted);
          
          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`rounded-full flex items-center justify-center ${stepSizeClass} ${isActive ? 'bg-primary-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} ${isClickable ? 'cursor-pointer hover:bg-opacity-90' : ''}`}
                  onClick={() => isClickable && handleStepClick(index)}
                >
                  {showIcons && isCompleted ? (
                    <FaCheck size={iconSize} />
                  ) : showNumbers ? (
                    <span className={fontSize}>{index + 1}</span>
                  ) : null}
                </div>
                
                {/* Step Label */}
                {showLabels && (
                  <div className="mt-2 text-center">
                    <div className={`font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-green-500' : 'text-gray-500'} ${fontSize}`}>
                      {step.title}
                    </div>
                    {step.description && (
                      <div className={`text-gray-500 ${fontSize === 'text-xs' ? 'text-xs' : 'text-xs'}`}>
                        {step.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${index < activeStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Render vertical stepper
  const renderVerticalStepper = () => {
    return (
      <div className="flex flex-col w-full">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isClickable = onStepClick && (isCompleted || allowClickOnCompleted);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className="flex">
              {/* Left side with circle and line */}
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`rounded-full flex items-center justify-center ${stepSizeClass} ${isActive ? 'bg-primary-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} ${isClickable ? 'cursor-pointer hover:bg-opacity-90' : ''}`}
                  onClick={() => isClickable && handleStepClick(index)}
                >
                  {showIcons && isCompleted ? (
                    <FaCheck size={iconSize} />
                  ) : showNumbers ? (
                    <span className={fontSize}>{index + 1}</span>
                  ) : null}
                </div>
                
                {/* Connector Line */}
                {!isLast && (
                  <div className={`w-0.5 h-full my-1 ${index < activeStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
              
              {/* Right side with content */}
              <div className={`ml-4 pb-8 ${isLast ? '' : 'mb-2'}`}>
                {/* Step Label */}
                {showLabels && (
                  <div>
                    <div className={`font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-green-500' : 'text-gray-500'} ${fontSize}`}>
                      {step.title}
                    </div>
                    {step.description && (
                      <div className={`text-gray-500 mt-1 ${fontSize === 'text-xs' ? 'text-xs' : 'text-xs'}`}>
                        {step.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {orientation === 'vertical' ? renderVerticalStepper() : renderHorizontalStepper()}
    </div>
  );
};

/**
 * Stepper.Step Component
 * 
 * A component to represent a single step in the stepper.
 * This is a convenience component for documentation purposes.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Step title
 * @param {string} props.description - Step description
 * @param {boolean} props.completed - Whether the step is completed
 * @param {boolean} props.active - Whether the step is active
 * @param {boolean} props.error - Whether the step has an error
 */
Stepper.Step = ({ title, description, completed, active, error }) => {
  // This component doesn't render anything on its own
  // It's just for documentation and type checking purposes
  return null;
};

/**
 * Stepper.Content Component
 * 
 * A component to display the content for the active step.
 * 
 * @param {Object} props - Component props
 * @param {number} props.activeStep - Index of the active step
 * @param {Array} props.children - Array of step contents
 * @param {string} props.className - Additional CSS classes for the content
 * @param {boolean} props.animate - Whether to animate transitions between steps
 */
Stepper.Content = ({ activeStep = 0, children, className = '', animate = true }) => {
  // Filter out non-element children
  const childrenArray = React.Children.toArray(children).filter(React.isValidElement);
  
  // Get the active step content
  const activeStepContent = childrenArray[activeStep];
  
  if (!activeStepContent) {
    return null;
  }
  
  return (
    <div className={`mt-6 ${animate ? 'transition-opacity duration-300' : ''} ${className}`}>
      {activeStepContent}
    </div>
  );
};

/**
 * Stepper.Actions Component
 * 
 * A component to display navigation buttons for the stepper.
 * 
 * @param {Object} props - Component props
 * @param {number} props.activeStep - Index of the active step
 * @param {number} props.totalSteps - Total number of steps
 * @param {function} props.onNext - Function to call when next button is clicked
 * @param {function} props.onBack - Function to call when back button is clicked
 * @param {function} props.onFinish - Function to call when finish button is clicked
 * @param {string} props.className - Additional CSS classes for the actions
 * @param {string} props.nextLabel - Label for the next button
 * @param {string} props.backLabel - Label for the back button
 * @param {string} props.finishLabel - Label for the finish button
 * @param {boolean} props.disableNext - Whether to disable the next button
 * @param {boolean} props.disableBack - Whether to disable the back button
 * @param {boolean} props.hideBackOnFirst - Whether to hide the back button on the first step
 */
Stepper.Actions = ({
  activeStep = 0,
  totalSteps,
  onNext,
  onBack,
  onFinish,
  className = '',
  nextLabel = 'Next',
  backLabel = 'Back',
  finishLabel = 'Finish',
  disableNext = false,
  disableBack = false,
  hideBackOnFirst = true,
}) => {
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;
  
  return (
    <div className={`flex justify-between mt-6 ${className}`}>
      <div>
        {(!isFirstStep || !hideBackOnFirst) && (
          <button
            type="button"
            className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${disableBack ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onBack}
            disabled={disableBack}
          >
            {backLabel}
          </button>
        )}
      </div>
      <div>
        {isLastStep ? (
          <button
            type="button"
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${disableNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onFinish}
            disabled={disableNext}
          >
            {finishLabel}
          </button>
        ) : (
          <button
            type="button"
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${disableNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onNext}
            disabled={disableNext}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Stepper;