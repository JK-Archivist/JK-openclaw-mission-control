"use client";
import React from 'react';

type Props = { children: React.ReactNode; variant?: 'muted'|'info'|'success'|'warning'|'danger' };
export default function Badge({ children, variant='muted' }: Props){
  const map: Record<string,string> = {
    muted: 'badge',
    info: 'badge badge-info',
    success: 'badge badge-success',
    warning: 'badge',
    danger: 'badge badge-danger',
  };
  return <span className={map[variant]}>{children}</span>;
}
