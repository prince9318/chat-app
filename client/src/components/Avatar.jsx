import { useState } from "react";
import assets from "../assets/assets";

const sizeMap = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-10 h-10 text-sm sm:w-11 sm:h-11",
  lg: "w-12 h-12 text-base sm:w-14 sm:h-14",
  xl: "w-20 h-20 text-2xl sm:w-24 sm:h-24",
  "2xl": "w-28 h-28 text-3xl sm:w-32 sm:h-32 md:w-36 md:h-36",
};

const shapeMap = {
  circle: "rounded-full",
  square: "rounded-[var(--radius-md)]",
  rounded: "rounded-[var(--radius-lg)]",
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const OnlineBadge = ({ online }) => {
  if (typeof online !== "boolean") return null;
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 block rounded-full ring-2 ring-[var(--bg-panel)] ${
        online
          ? "w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[var(--accent)]"
          : "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[var(--text-muted)]"
      }`}
    />
  );
};

const AvatarContent = ({ errored, src, name, alt, lazy, imgClassName, onError }) => {
  if (name && (!src || errored)) {
    return (
      <span className="font-semibold text-[var(--text-secondary)] select-none">
        {getInitials(name)}
      </span>
    );
  }
  const resolvedSrc = !errored && src ? src : assets.avatar_icon;
  const imageAlt = alt || (name ? `${name} avatar` : "avatar");
  return (
    <img
      src={resolvedSrc}
      alt={imageAlt}
      draggable={false}
      loading={lazy ? "lazy" : "eager"}
      onError={onError}
      className={`w-full h-full object-cover ${imgClassName}`}
    />
  );
};

const Avatar = ({
  src,
  alt = "",
  name,
  size = "md",
  shape = "circle",
  online,
  ring = false,
  ringOnHover = false,
  className = "",
  imgClassName = "",
  onClick,
  lazy = false,
}) => {
  const [errored, setErrored] = useState(false);

  const baseShape = shapeMap[shape] || shapeMap.circle;
  const ringClasses = ring
    ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-panel)]"
    : "";
  const hoverRingClasses = ringOnHover
    ? "transition-[box-shadow] duration-200 hover:ring-2 hover:ring-[var(--accent)] hover:ring-offset-2 hover:ring-offset-[var(--bg-panel)]"
    : "";
  const containerSizeClass = sizeMap[size] || sizeMap.md;

  let interactiveProps = {};
  if (onClick) {
    interactiveProps = {
      role: "button",
      tabIndex: 0,
      onClick: (e) => {
        e.stopPropagation();
        onClick(e);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClick(e);
        }
      },
      "aria-label": name ? `${name} avatar` : "Avatar",
    };
  }

  return (
    <div
      className={`relative shrink-0 inline-block ${containerSizeClass} ${className}`}
    >
      <div
        {...interactiveProps}
        className={`w-full h-full flex items-center justify-center overflow-hidden bg-[var(--bg-input)] ${baseShape} ${ringClasses} ${hoverRingClasses} ${
          onClick ? "cursor-pointer select-none" : ""
        }`}
      >
        <AvatarContent
          errored={errored}
          src={src}
          name={name}
          alt={alt}
          lazy={lazy}
          imgClassName={imgClassName}
          onError={() => setErrored(true)}
        />
      </div>
      <OnlineBadge online={online} />
    </div>
  );
};

export default Avatar;
