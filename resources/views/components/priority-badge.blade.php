@php
$priority = ucfirst(strtolower($priority ?? 'Low'));

$config = match ($priority) {
    'High' => [
        'classes' => 'bg-rose-50 text-rose-700 ring-rose-600/20',
        'dot' => 'bg-rose-500',
    ],

    'Medium' => [
        'classes' => 'bg-amber-50 text-amber-700 ring-amber-600/20',
        'dot' => 'bg-amber-500',
    ],

    default => [
        'classes' => 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        'dot' => 'bg-emerald-500',
    ],
};


@endphp

<span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset {{ $config['classes'] }}">
    <span class="h-1.5 w-1.5 rounded-full {{ $config['dot'] }}"></span>

```
{{ $priority }}
```

</span>
