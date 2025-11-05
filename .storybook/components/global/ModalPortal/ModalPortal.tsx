import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './ModalPortal.scss';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import { ButtonThemed } from '@components/shared';

interface HeaderProps {
  icon?: {
    path: string;
    alt: string;
  };
  title?: React.ReactNode | null;
  onClose?: () => void;
}

interface FooterProps {
  buttons: {
    text: string;
    onClick: () => void;
    variant: 'primary' | 'secondary';
    ariaLabel?: string;
    disabled?: boolean;
    icon?: {
      path: string;
      alt: string;
      position: 'start' | 'end';
    };
  }[];
}
interface ModalProps {
  isOpen: boolean;
  size?: 'content' | 'sm' | 'lg' | 'xl';
  className?: string;
  onClose?: () => void;
  children: React.ReactNode;
  overlayKeysCloseOverride?: boolean;
  style?: React.CSSProperties;
}

interface ModalPortalComponent extends React.FC<ModalProps> {
  Header: React.FC<HeaderProps>;
  Footer: React.FC<FooterProps>;
}

const ModalPortal: ModalPortalComponent = ({
  isOpen,
  size,
  onClose,
  children,
  overlayKeysCloseOverride,
  className,
  style
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(false);
  const [displayModal, setDisplayModal] = React.useState(false);
  const { t } = useTranslation(['common']);
  const bodyClassForModal = 'modal-open';

  const handleClose = () => {
    document.body.classList.remove(bodyClassForModal);
    if (onClose) onClose();
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setDisplayModal(true);
    } else {
      setShow(false);
      setTimeout(() => {
        setDisplayModal(false);
      }, 300);
    }
  }, [isOpen]);

  // Manage body scroll lock class
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(bodyClassForModal);
    } else {
      document.body.classList.remove(bodyClassForModal);
    }
    return () => {
      document.body.classList.remove(bodyClassForModal);
    };
  }, [isOpen]);

  // Trap focus within the modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus on the first focusable element when the modal opens
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // Trap focus within the modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      modalRef.current.addEventListener('keydown', handleTabKey);

      // Cleanup event listener on close
      return () => {
        modalRef.current &&
          modalRef.current.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen]);

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!overlayKeysCloseOverride && (event.key === 'Enter' || event.key === ' ')) {
      handleClose();
    }
  };

  if (!isOpen && !displayModal) {
    return null;
  }

  const modalClasses = cx({ modal: true, fade: true, show: show }, className);
  const modalDialogSizeClass =
    size === 'content' ? 'modal-fit-content' : size ? `modal-${size}` : '';
  const dialogClasses = cx('modal-dialog', 'modal-dialog-centered', modalDialogSizeClass);

  return ReactDOM.createPortal(
    <>
      {/* Backdrop rendered inside the same portal to ensure consistent stacking */}
      <div className="modal-backdrop fade show" aria-hidden="true" />

      <div
        className={modalClasses}
        onClick={handleClose}
        onKeyDown={handleOverlayKeyDown}
        aria-label={t('Close') as string}
        aria-hidden={!displayModal}
      >
        <div className={dialogClasses}>
          <div
            ref={modalRef}
            className="modal-content"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()} // Prevents closing when clicking on the modal content
            style={style}
          >
            {children}
          </div>
        </div>
      </div>
    </>,
    document.getElementById('modal-root') as HTMLElement
  );
};

const Header: React.FC<HeaderProps> = ({ icon, title, onClose }) => {
  const { t } = useTranslation(['common']);
  return (
    <div className="modal-header fs-5">
      {icon && <img src={icon.path} alt={icon.alt} />}
      {title && <h1 className="modal-title fs-5">{title}</h1>}
      {onClose && (
        <button
          className="modal-close btn-close"
          onClick={onClose}
          aria-label={t('Close') as string} // Accessibility label for the close button
        ></button>
      )}
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ buttons }) => {
  return (
    <div className="modal-footer">
      {buttons.map((button, index) => (
        <ButtonThemed
          key={'footer-btn_' + button.variant + '_' + index}
          variant={button.variant}
          label={button.ariaLabel}
          disabled={button.disabled}
          onClick={button.onClick}>
          {button.icon && (
            <img
              src={button.icon.path}
              alt={button.icon.alt}
              className={`icon icon-${button.icon.position}`}
            />
          )}
          {button.text}
        </ButtonThemed>
      ))}
    </div>
  );
};

ModalPortal.Header = Header;
ModalPortal.Footer = Footer;

export { ModalPortal };
export default ModalPortal;
