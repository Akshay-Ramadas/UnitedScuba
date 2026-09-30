import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

export async function saveSortOrder(path, token, ordered) {
  await api(`/api/admin/${path}/order`, {
    method: 'PUT',
    token,
    body: { ids: ordered.map((item) => item._id) },
  });
}

const SHIFT_MS = 110;

function layoutRect(node) {
  const rect = node.getBoundingClientRect();
  const matrix = new DOMMatrix(getComputedStyle(node).transform);
  return {
    left: rect.left - matrix.m41,
    top: rect.top - matrix.m42,
    right: rect.right - matrix.m41,
    bottom: rect.bottom - matrix.m42,
  };
}

function indexAt(x, y, nodes) {
  for (let i = 0; i < nodes.length; i += 1) {
    const box = layoutRect(nodes[i]);
    if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return i;
  }
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < nodes.length; i += 1) {
    const box = layoutRect(nodes[i]);
    const dx = x < box.left ? box.left - x : x > box.right ? x - box.right : 0;
    const dy = y < box.top ? box.top - y : y > box.bottom ? y - box.bottom : 0;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function slideIntoPlace(list, before) {
  list.querySelectorAll('[data-sort-id]').forEach((node) => {
    if (node.classList.contains('sort-hold')) return;
    const prev = before.get(node.dataset.sortId);
    if (!prev) return;
    const box = node.getBoundingClientRect();
    const dx = prev.left - box.left;
    const dy = prev.top - box.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    node.getAnimations().forEach((anim) => anim.cancel());
    node.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
      { duration: SHIFT_MS, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    );
  });
}

export default function SortableGrid({ items, className, onReorder, renderItem }) {
  const [order, setOrder] = useState(items);
  const [activeId, setActiveId] = useState(null);
  const orderRef = useRef(order);
  const dragRef = useRef(null);
  const listRef = useRef(null);
  const floatRef = useRef(null);
  const beforeRef = useRef(null);
  const ids = items.map((item) => item._id).join('|');
  orderRef.current = order;

  useEffect(() => {
    if (!activeId) setOrder(items);
  }, [ids, activeId, items]);

  useEffect(() => {
    if (!activeId) return undefined;
    const move = (event) => {
      const drag = dragRef.current;
      const list = listRef.current;
      if (!drag || !list) return;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (floatRef.current) {
        floatRef.current.style.left = `${event.clientX - drag.ox}px`;
        floatRef.current.style.top = `${event.clientY - drag.oy}px`;
      }
      const nodes = [...list.children].filter((node) => node.dataset.sortId);
      const from = nodes.findIndex((node) => node.dataset.sortId === drag.id);
      if (from < 0) return;
      const next = indexAt(event.clientX, event.clientY, nodes);
      if (next === from) return;
      const before = new Map(nodes.map((node) => [node.dataset.sortId, node.getBoundingClientRect()]));
      const moving = nodes[from];
      if (from < next) nodes[next].after(moving);
      else nodes[next].before(moving);
      drag.liveIds = [...list.children].filter((node) => node.dataset.sortId).map((node) => node.dataset.sortId);
      slideIntoPlace(list, before);
    };
    const up = () => {
      const drag = dragRef.current;
      const list = listRef.current;
      dragRef.current = null;
      const ids = drag?.liveIds || (list
        ? [...list.children].filter((node) => node.dataset.sortId).map((node) => node.dataset.sortId)
        : []);
      const byId = new Map(orderRef.current.map((item) => [item._id, item]));
      const next = ids.map((id) => byId.get(id)).filter(Boolean);
      if (next.length) setOrder(next);
      setActiveId(null);
      if (!drag || !next.length || drag.startKey === ids.join('|')) return;
      onReorder(next);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [activeId, onReorder]);

  const orderKey = order.map((item) => item._id).join('|');
  useLayoutEffect(() => {
    const drag = dragRef.current;
    const list = listRef.current;
    if (!drag?.liveIds || !list) return;
    const now = [...list.children].filter((node) => node.dataset.sortId).map((node) => node.dataset.sortId);
    if (now.join('|') === drag.liveIds.join('|')) return;
    const byId = new Map([...list.children].map((node) => [node.dataset.sortId, node]));
    drag.liveIds.forEach((id) => {
      const node = byId.get(id);
      if (node) list.appendChild(node);
    });
  });
  useLayoutEffect(() => {
    const drag = dragRef.current;
    const el = floatRef.current;
    if (drag && el) {
      el.style.left = `${drag.x - drag.ox}px`;
      el.style.top = `${drag.y - drag.oy}px`;
      el.style.width = `${drag.w}px`;
      el.style.height = `${drag.h}px`;
    }
    const before = beforeRef.current;
    const list = listRef.current;
    if (!before || !list) return;
    beforeRef.current = null;
    list.querySelectorAll('[data-sort-id]').forEach((node) => {
      const prev = before.get(node.dataset.sortId);
      if (!prev) return;
      const box = node.getBoundingClientRect();
      const dx = prev.left - box.left;
      const dy = prev.top - box.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      node.getAnimations().forEach((anim) => anim.cancel());
      node.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
        { duration: SHIFT_MS, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
    });
  }, [orderKey, activeId]);

  function beginDrag(event, item) {
    if (event.button != null && event.button !== 0) return;
    const shell = event.currentTarget.closest('[data-sort-id]');
    const rect = shell.getBoundingClientRect();
    dragRef.current = {
      id: item._id,
      ox: event.clientX - rect.left,
      oy: event.clientY - rect.top,
      x: event.clientX,
      y: event.clientY,
      w: rect.width,
      h: rect.height,
      startKey: orderRef.current.map((entry) => entry._id).join('|'),
      liveIds: orderRef.current.map((entry) => entry._id),
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setActiveId(item._id);
  }

  const active = order.find((item) => item._id === activeId);

  return (
    <>
      <div className={className} ref={listRef}>
        {order.map((item) => (
          <div
            key={item._id}
            className={`sort-item${item._id === activeId ? ' sort-hold' : ''}`}
            data-sort-id={item._id}
          >
            <button
              type="button"
              className="sort-grip"
              aria-label="Drag to reorder"
              onPointerDown={(event) => beginDrag(event, item)}
            >
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </button>
            {renderItem(item)}
          </div>
        ))}
      </div>
      {active && (
        <div className="sort-float" ref={floatRef}>
          {renderItem(active)}
        </div>
      )}
    </>
  );
}
