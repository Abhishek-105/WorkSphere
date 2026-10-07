@php
$status = $status ?? 'Pending';


$config = match ($status) {
    'In Progress' => [
        'label' => 'In Progress',
        'classes' => 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        'dot' => 'bg-indigo-500',
    ],

    'Done' => [
        'label' => 'Completed',
        'classes' => 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        'dot' => 'bg-emerald-500',
    ],

    'Blocked' => [
        'label' => 'Blocked',
        'classes' => 'bg-rose-50 text-rose-700 ring-rose-600/20',
        'dot' => 'bg-rose-500',
    ],

    default => [
        'label' => 'Pending',
        'classes' => 'bg-slate-100 text-slate-700 ring-slate-500/20',
        'dot' => 'bg-slate-500',
    ],
};


@endphp

<span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset {{ $config['classes'] }}">
    <span class="h-1.5 w-1.5 rounded-full {{ $config['dot'] }}"></span>

```
{{ $config['label'] }}
```

</span>
